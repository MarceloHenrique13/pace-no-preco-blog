import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { connection } from "next/server";
import {
  getWeeklyHighlightsFromStore,
  listAllImageOverrides,
  listAllOverrides,
  listImageOverridesForPost,
  listOverridesForPost,
  listPublishedSlugs,
  seedWeeklyHighlightsIfEmpty,
  type PostImageOverrides,
} from "@/lib/affiliate-store";
import { isPostPublic } from "@/lib/publish";
import {
  postFrontmatterSchema,
  weeklyHighlightsSchema,
  type Post,
  type Shoe,
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

export function applyAffiliateOverrides(
  shoes: Shoe[],
  overrides: Map<string, string>,
): Shoe[] {
  if (!overrides.size) return shoes;

  return shoes.map((shoe) => {
    const nextUrl = overrides.get(shoe.name);
    if (!nextUrl) return shoe;
    return { ...shoe, affiliateUrl: nextUrl };
  });
}

export function applyImageOverrides(
  post: Post,
  images: PostImageOverrides,
): Post {
  const coverImage = images.coverImage?.trim() || post.coverImage;
  const shoes =
    images.shoes.size === 0
      ? post.shoes
      : post.shoes.map((shoe) => {
          const nextImage = images.shoes.get(shoe.name);
          if (!nextImage) return shoe;
          return { ...shoe, image: nextImage };
        });

  if (coverImage === post.coverImage && shoes === post.shoes) {
    return post;
  }

  return { ...post, coverImage, shoes };
}

function mergePostOverrides(
  post: Post,
  affiliate: Map<string, string>,
  images: PostImageOverrides,
): Post {
  return applyImageOverrides(
    {
      ...post,
      shoes: applyAffiliateOverrides(post.shoes, affiliate),
    },
    images,
  );
}

function readWeeklyHighlightsFile(): WeeklyHighlights {
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

function listMdxPosts(): Post[] {
  ensurePostsDir();
  const files = fs
    .readdirSync(postsDirectory)
    .filter((name) => name.endsWith(".mdx") || name.endsWith(".md"));

  const posts: Post[] = [];
  for (const file of files) {
    try {
      posts.push(parsePostFile(path.join(postsDirectory, file)));
    } catch (error) {
      console.error(`Skipping invalid post file ${file}`, error);
    }
  }
  return posts;
}

export async function getAllPosts({
  forAdmin = false,
}: {
  forAdmin?: boolean;
} = {}): Promise<Post[]> {
  await connection();
  const [publishedSlugs, overridesByPost, imagesByPost] = await Promise.all([
    listPublishedSlugs(),
    listAllOverrides(),
    listAllImageOverrides(),
  ]);

  const posts = listMdxPosts()
    .map((post) => {
      if (forAdmin) return post;
      const overrides = overridesByPost.get(post.slug) ?? new Map();
      const images = imagesByPost.get(post.slug) ?? {
        coverImage: null,
        shoes: new Map(),
      };
      return mergePostOverrides(post, overrides, images);
    })
    .filter((post) => forAdmin || isPostPublic(post, publishedSlugs))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return posts;
}

export async function getPostBySlug(
  slug: string,
  { forAdmin = false }: { forAdmin?: boolean } = {},
): Promise<Post | undefined> {
  await connection();
  const post = listMdxPosts().find((candidate) => candidate.slug === slug);
  if (!post) return undefined;

  if (!forAdmin) {
    const publishedSlugs = await listPublishedSlugs();
    if (!isPostPublic(post, publishedSlugs)) return undefined;
  }

  if (forAdmin) {
    return post;
  }

  const [overrides, images] = await Promise.all([
    listOverridesForPost(slug),
    listImageOverridesForPost(slug),
  ]);
  return mergePostOverrides(post, overrides, images);
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter(
    (post) => post.category.toLowerCase() === category.toLowerCase(),
  );
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  const set = new Set(posts.map((post) => post.category));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
}

export async function getRelatedPosts(
  post: Post,
  limit = 3,
): Promise<Post[]> {
  const all = await getAllPosts();
  const sameCategory = all.filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      candidate.category.toLowerCase() === post.category.toLowerCase(),
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const extras = all.filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      !sameCategory.some((related) => related.slug === candidate.slug),
  );

  return [...sameCategory, ...extras].slice(0, limit);
}

export async function getWeeklyHighlights(): Promise<WeeklyHighlights> {
  await connection();

  const fromStore = await getWeeklyHighlightsFromStore();
  if (fromStore) {
    return {
      ...fromStore,
      shoes: [...fromStore.shoes].sort((a, b) => a.rank - b.rank),
    };
  }

  const fileData = readWeeklyHighlightsFile();

  try {
    await seedWeeklyHighlightsIfEmpty(fileData);
  } catch (error) {
    console.error("highlight seed failed", error);
  }

  const seeded = await getWeeklyHighlightsFromStore();
  if (seeded) {
    return {
      ...seeded,
      shoes: [...seeded.shoes].sort((a, b) => a.rank - b.rank),
    };
  }

  return fileData;
}
