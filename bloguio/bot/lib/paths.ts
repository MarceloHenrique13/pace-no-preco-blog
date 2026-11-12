import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const POST_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/;
const IMAGE_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(jpg|jpeg|png|webp)$/;

export type BlogPaths = {
  root: string;
  postsDir: string;
  highlightsFile: string;
  contractFile: string;
  imagePostsDir: string;
  imageShoesDir: string;
};

function hasBlogMarkers(dir: string): boolean {
  return (
    existsSync(path.join(dir, "CONTENT.md")) &&
    existsSync(path.join(dir, "content", "posts"))
  );
}

function walkUp(start: string): string | undefined {
  let current = path.resolve(start);
  const seen = new Set<string>();
  while (!seen.has(current)) {
    seen.add(current);
    if (hasBlogMarkers(current)) return current;
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
  return undefined;
}

export function resolveBlogRoot(): string {
  const fromEnv = process.env.BLOG_ROOT?.trim();
  if (fromEnv) {
    const resolved = path.resolve(fromEnv);
    if (!hasBlogMarkers(resolved)) {
      throw new Error(
        `BLOG_ROOT não é a raiz do Pace no Preço (falta CONTENT.md ou content/posts): ${resolved}`,
      );
    }
    return resolved;
  }

  const here = path.dirname(fileURLToPath(import.meta.url));
  return (
    walkUp(here) ??
    walkUp(process.cwd()) ??
    (() => {
      throw new Error(
        "Não achei a raiz do blog. Defina BLOG_ROOT apontando para o checkout do Pace no Preço.",
      );
    })()
  );
}

export function blogPaths(root = resolveBlogRoot()): BlogPaths {
  return {
    root,
    postsDir: path.join(root, "content", "posts"),
    highlightsFile: path.join(root, "content", "destaques-semana.json"),
    contractFile: path.join(root, "CONTENT.md"),
    imagePostsDir: path.join(root, "public", "images", "posts"),
    imageShoesDir: path.join(root, "public", "images", "shoes"),
  };
}

export function assertInside(parent: string, candidate: string): string {
  const root = path.resolve(parent);
  const target = path.resolve(root, candidate);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Caminho fora da pasta permitida.");
  }
  return target;
}

export function postFilePath(paths: BlogPaths, slug: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug inválido.");
  }
  return assertInside(paths.postsDir, `${slug}.mdx`);
}

export type ReadableKind =
  | "contract"
  | "post"
  | "highlights"
  | "image-posts"
  | "image-shoes";

export function resolveReadable(
  paths: BlogPaths,
  relativePath: string,
): { kind: ReadableKind; absolute: string } {
  const normalized = relativePath.replaceAll("\\", "/").replace(/^\.\//, "");
  if (normalized === "CONTENT.md") {
    return { kind: "contract", absolute: paths.contractFile };
  }
  if (normalized === "content/destaques-semana.json") {
    return { kind: "highlights", absolute: paths.highlightsFile };
  }
  if (normalized.startsWith("content/posts/")) {
    const base = path.posix.basename(normalized);
    if (!POST_FILE.test(base) || normalized !== `content/posts/${base}`) {
      throw new Error("Só leio content/posts/<slug>.mdx.");
    }
    return {
      kind: "post",
      absolute: assertInside(paths.postsDir, base),
    };
  }
  if (normalized.startsWith("public/images/posts/")) {
    const base = path.posix.basename(normalized);
    if (!IMAGE_FILE.test(base) || normalized !== `public/images/posts/${base}`) {
      throw new Error("Imagem de capa fora de public/images/posts/.");
    }
    return {
      kind: "image-posts",
      absolute: assertInside(paths.imagePostsDir, base),
    };
  }
  if (normalized.startsWith("public/images/shoes/")) {
    const base = path.posix.basename(normalized);
    if (!IMAGE_FILE.test(base) || normalized !== `public/images/shoes/${base}`) {
      throw new Error("Imagem de tênis fora de public/images/shoes/.");
    }
    return {
      kind: "image-shoes",
      absolute: assertInside(paths.imageShoesDir, base),
    };
  }
  throw new Error(
    "Leitura recusada. Permitido: CONTENT.md, content/posts/<slug>.mdx, content/destaques-semana.json, public/images/posts|shoes/<arquivo>.",
  );
}

export function listImageFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => IMAGE_FILE.test(name) && statSync(path.join(dir, name)).isFile())
    .sort();
}
