import { writeFileSync } from "node:fs";
import { defineTool } from "@grok/agent-sdk/tools";
import { prompt } from "@grok/agent-sdk";
import { z } from "zod/v4";
import { AFFILIATE_PLACEHOLDER, requestsProvidedAffiliate } from "../lib/affiliates.js";
import { gatePost, renderMdx } from "../lib/content-gate.js";
import { blogPaths, postFilePath } from "../lib/paths.js";

const shoeSchema = z.object({
  rank: z.number().int(),
  name: z.string(),
  brand: z.string(),
  affiliateUrl: z.string(),
  image: z.string(),
  pros: z.array(z.string()),
  bestFor: z.string(),
});

export default defineTool({
  description: prompt`
    Grava um rascunho em content/posts/<slug>.mdx. Posts novos saem draft: true.
    affiliateUrl padrão: ${AFFILIATE_PLACEHOLDER}. Não invente meli.la nem URL do Mercado Livre.
    Ranking "Os 5 melhores…" leva exatamente 5 shoes. Sem foto certa do modelo, use
    /images/shoes/pendente-<slug-do-nome>.jpg e sinalize. Não publica, não faz commit e não mexe em app/.
  `,
  effect: "write",
  needsApproval: (input) => requestsProvidedAffiliate(input),
  inputSchema: z.object({
    keyword: z.string(),
    intention: z.enum(["informacional", "comercial", "comparativa"]),
    secondaryKeywords: z.array(z.string()).min(3).max(5),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    coverImage: z.string(),
    shoes: z.array(shoeSchema).max(5).default([]),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    body: z.string(),
    linksInformadosPeloMarcelo: z.array(z.string()).default([]),
  }),
  dryRunResult: { ok: false, persisted: false, dryRun: true },
  async execute(input, ctx) {
    try {
      const paths = blogPaths();
      const gated = gatePost(paths, input);
      if (!gated.ok) return { ok: false as const, errors: gated.errors };
      if (gated.needsHumanLinkApproval && !ctx.approvedBy) {
        return {
          ok: false as const,
          errors: [
            "Link informado pelo Marcelo só entra no arquivo depois da aprovação humana desta tool. No schedule, use só o placeholder.",
          ],
        };
      }
      const mdx = renderMdx(gated.post);
      const persist = ctx.session.purpose !== "eval" && ctx.session.dryRun !== true;
      if (persist) {
        writeFileSync(postFilePath(paths, gated.post.slug), mdx, "utf8");
      }
      return {
        ok: true as const,
        keyword: input.keyword.trim(),
        intention: input.intention,
        secondaryKeywords: input.secondaryKeywords,
        format: gated.format,
        slug: gated.post.slug,
        path: `content/posts/${gated.post.slug}.mdx`,
        draft: true as const,
        shoeCount: gated.post.shoes.length,
        frontmatterValid: true as const,
        affiliateUrls: gated.post.shoes.map((shoe) => shoe.affiliateUrl),
        imageFlags: gated.imageFlags,
        linksParaColarNoAdmin: gated.linksParaColarNoAdmin,
        persisted: persist,
        approvalLine: "aguardando aprovação humana (links)",
      };
    } catch (error) {
      return {
        ok: false as const,
        errors: [error instanceof Error ? error.message : "Falha ao gravar o post."],
      };
    }
  },
});
