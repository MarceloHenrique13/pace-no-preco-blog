import { readdirSync } from "node:fs";
import path from "node:path";
import { defineTool } from "@grok/agent-sdk/tools";
import { prompt } from "@grok/agent-sdk";
import { z } from "zod/v4";
import { existingPosts } from "../lib/content-gate.js";
import { blogPaths, listImageFiles } from "../lib/paths.js";

export default defineTool({
  description: prompt`
    Lista os posts já publicados ou em rascunho, mais as imagens locais.
    Chame antes de escolher keyword ou slug, para não canibalizar um post existente.
  `,
  inputSchema: z.object({}),
  effect: "read",
  execute() {
    try {
      const paths = blogPaths();
      const posts = existingPosts(paths).map((post) => ({
        slug: post.slug,
        path: `content/posts/${post.file}`,
        draft: post.draft,
      }));
      return {
        ok: true as const,
        posts,
        postFiles: readdirSync(paths.postsDir).filter((file) => file.endsWith(".mdx")),
        images: {
          posts: listImageFiles(paths.imagePostsDir).map((file) => `/images/posts/${file}`),
          shoes: listImageFiles(paths.imageShoesDir).map((file) => `/images/shoes/${file}`),
        },
        blogRoot: path.basename(paths.root),
      };
    } catch (error) {
      return {
        ok: false as const,
        errors: [error instanceof Error ? error.message : "Falha ao listar posts."],
      };
    }
  },
});
