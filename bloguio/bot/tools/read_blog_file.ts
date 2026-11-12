import { readFileSync } from "node:fs";
import { defineTool } from "@grok/agent-sdk/tools";
import { prompt } from "@grok/agent-sdk";
import { z } from "zod/v4";
import { blogPaths, resolveReadable } from "../lib/paths.js";

const MAX_CHARS = 100_000;

export default defineTool({
  description: prompt`
    Lê um arquivo permitido do blog: CONTENT.md, content/posts/<slug>.mdx,
    content/destaques-semana.json ou uma imagem já listada em public/images/posts|shoes.
    Não lê app/, components/, lib/ nem segredo.
  `,
  inputSchema: z.object({
    path: z.string().describe("Caminho relativo à raiz do blog."),
  }),
  effect: "read",
  execute({ path: relativePath }) {
    try {
      const resolved = resolveReadable(blogPaths(), relativePath);
      if (resolved.kind === "image-posts" || resolved.kind === "image-shoes") {
        return {
          ok: true as const,
          path: relativePath,
          note: "Arquivo de imagem existe. Não devolvo os bytes. Use só se o nome do arquivo for o modelo exato.",
        };
      }
      const text = readFileSync(resolved.absolute, "utf8");
      return {
        ok: true as const,
        path: relativePath,
        truncated: text.length > MAX_CHARS,
        content: text.slice(0, MAX_CHARS),
      };
    } catch (error) {
      return {
        ok: false as const,
        errors: [error instanceof Error ? error.message : "Falha ao ler arquivo."],
      };
    }
  },
});
