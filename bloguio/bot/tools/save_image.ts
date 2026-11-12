import { writeFileSync } from "node:fs";
import path from "node:path";
import { defineTool } from "@grok/agent-sdk/tools";
import { prompt } from "@grok/agent-sdk";
import { z } from "zod/v4";
import { isBlockedCommerceHost } from "../lib/affiliates.js";
import { imageSize } from "../lib/images.js";
import { assertInside, blogPaths } from "../lib/paths.js";

const FILE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(jpg|jpeg|png)$/;

export default defineTool({
  description: prompt`
    Grava uma imagem que você já tem em bytes (jpg ou png) em public/images/posts ou public/images/shoes.
    Não baixa URL. Recusa Mercado Livre, mlstatic e meli.la. Sem certeza de que os bytes são o modelo exato, não chame: use o caminho pendente no post.
  `,
  effect: "write",
  inputSchema: z.object({
    folder: z.enum(["posts", "shoes"]),
    filename: z.string(),
    bytesBase64: z.string(),
  }),
  dryRunResult: { ok: false, persisted: false, dryRun: true },
  async execute({ folder, filename, bytesBase64 }, ctx) {
    if (!FILE_NAME.test(filename) || filename.includes("pendente")) {
      return {
        ok: false as const,
        errors: [
          "Nome do arquivo: kebab-case, extensão jpg ou png, sem a palavra pendente. Pendente é só referência, não um arquivo falso.",
        ],
      };
    }
    let bytes: Buffer;
    try {
      bytes = Buffer.from(bytesBase64, "base64");
    } catch {
      return { ok: false as const, errors: ["Base64 inválido."] };
    }
    if (bytes.length < 32 || bytes.length > 2_000_000) {
      return { ok: false as const, errors: ["Imagem vazia ou maior que 2 MB."] };
    }
    const head = bytes.subarray(0, 256).toString("utf8").toLowerCase();
    if (head.includes("<html") || head.includes("mercadolivre") || head.includes("mlstatic")) {
      return { ok: false as const, errors: ["O conteúdo não é uma foto. Não raspo página do Mercado Livre."] };
    }
    try {
      const hostMatch = head.match(/https?:\/\/([^/\s]+)/);
      if (hostMatch && isBlockedCommerceHost(hostMatch[1])) {
        return { ok: false as const, errors: ["Conteúdo aponta para host do Mercado Livre."] };
      }
    } catch {
      return { ok: false as const, errors: ["Não consegui inspecionar a imagem."] };
    }
    const size = imageSize(bytes);
    if (!size || size.width < 320 || size.height < 320) {
      return {
        ok: false as const,
        errors: ["Preciso de jpg ou png com pelo menos 320px de cada lado. Ícone e pixel não servem de foto de modelo."],
      };
    }
    const paths = blogPaths();
    const dir = folder === "posts" ? paths.imagePostsDir : paths.imageShoesDir;
    const target = assertInside(dir, filename);
    const persist = ctx.session.purpose !== "eval" && ctx.session.dryRun !== true;
    if (persist) writeFileSync(target, bytes);
    return {
      ok: true as const,
      path: `/images/${folder}/${path.basename(target)}`,
      width: size.width,
      height: size.height,
      persisted: persist,
      flag: "Confirme se este arquivo é o modelo exato, não um colorway parecido.",
    };
  },
});
