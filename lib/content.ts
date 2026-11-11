import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import {
  postFrontmatterSchema,
  weeklyHighlightsSchema,
  type Post,
  type WeeklyHighlights,
} from "./schema";

const postsDirectory = path.join(process.cwd(), "content", "posts");
const weeklyHighlightsPath = path.join(
  process.cwd(),
  "content",
  "destaques-semana.json",
);

function ensurePostsDir() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

function parsePostFile(filePath: string): Post {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const parsed = postFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Frontmatter inválido em ${path.basename(filePath)}: ${details}`);
  }

  const stats = readingTime(content);

  return {
    ...parsed.data,
    content,
    readingTime: stats.text.replace("read", "de leitura"),
  };
}

export function getAllPosts({ includeDrafts = false } = {}): Post[] {
  ensurePostsDir();
  const files = fs
    .readdirSync(postsDirectory)
    .filter((name) => name.endsWith(".mdx") || name.endsWith(".md"));

  const posts = files.map((file) => parsePostFile(path.join(postsDirectory, file)));

  return posts
    .filter((post) => includeDrafts || !post.draft)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts({ includeDrafts: true }).find((post) => post.slug === slug);
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter(
    (post) => post.category.toLowerCase() === category.toLowerCase(),
  );
}

export function getAllCategories(): string[] {
  const set = new Set(getAllPosts().map((post) => post.category));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const sameCategory = getAllPosts().filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      candidate.category.toLowerCase() === post.category.toLowerCase(),
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const extras = getAllPosts().filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      !sameCategory.some((related) => related.slug === candidate.slug),
  );

  return [...sameCategory, ...extras].slice(0, limit);
}

export function getWeeklyHighlights(): WeeklyHighlights {
  if (!fs.existsSync(weeklyHighlightsPath)) {
    throw new Error("Arquivo content/destaques-semana.json não encontrado");
  }

  const raw = fs.readFileSync(weeklyHighlightsPath, "utf8");
  const parsed = weeklyHighlightsSchema.safeParse(JSON.parse(raw));

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`destaques-semana.json inválido: ${details}`);
  }

  return {
    ...parsed.data,
    shoes: [...parsed.data.shoes].sort((a, b) => a.rank - b.rank),
  };
}
