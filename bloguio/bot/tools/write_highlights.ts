import { writeFileSync } from "node:fs";
import { defineTool } from "@grok/agent-sdk/tools";
import { prompt } from "@grok/agent-sdk";
import { z } from "zod/v4";
import { AFFILIATE_PLACEHOLDER, classifyAffiliateUrl } from "../lib/affiliates.js";
import { checkImageReference } from "../lib/images.js";
import { blogPaths } from "../lib/paths.js";

const shoeSchema = z.object({
  rank: z.number().int().min(1).max(5),
  name: z.string(),
  brand: z.string(),
  affiliateUrl: z.string(),
  image: z.string(),
  bestFor: z.string(),
});

export default defineTool({
  description: prompt`
    Atualiza content/destaques-semana.json. Só chame se o Marcelo pedir os destaques da semana.
    Exige aprovação humana. Sempre 5 tênis. Sem link inventado: use ${AFFILIATE_PLACEHOLDER}
    a menos que ele tenha colado a URL e aprovado esta chamada.
  `,
  effect: "write",
  needsApproval: true,
  inputSchema: z.object({
    weekLabel: z.string().min(1),
    updatedAt: z.string(),
    shoes: z.array(shoeSchema).length(5),
    linksInformadosPeloMarcelo: z.array(z.string()).default([]),
  }),
  dryRunResult: { ok: false, persisted: false, dryRun: true },
  async execute(input, ctx) {
    const errors: string[] = [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.updatedAt)) {
      errors.push("updatedAt no formato YYYY-MM-DD.");
    }
    const ranks = new Set(input.shoes.map((shoe) => shoe.rank));
    if (ranks.size !== 5) errors.push("Destaques precisam dos ranks 1 a 5, sem repetir.");
  const paths = blogPaths();
  const shoes: Array<{
    rank: number;
    name: string;
    brand: string;
    affiliateUrl: string;
    image: string;
    bestFor: string;
  }> = [];
    const images = new Set<string>();
    for (const shoe of input.shoes) {
      const affiliate = classifyAffiliateUrl(shoe.affiliateUrl, input.linksInformadosPeloMarcelo);
      if (affiliate.kind === "reject") {
        errors.push(`${shoe.name}: ${affiliate.reason}`);
        continue;
      }
      if (affiliate.kind === "provided" && !ctx.approvedBy) {
        errors.push("Link real de destaque só depois da aprovação humana.");
        continue;
      }
      const image = checkImageReference(paths, shoe.image, shoe.name, "shoes");
      if (!image.ok) {
        errors.push(`${shoe.name}: ${image.reason}`);
        continue;
      }
      if (images.has(image.publicPath)) {
        errors.push(`Foto repetida em destaques: ${image.publicPath}.`);
      }
      images.add(image.publicPath);
      shoes.push({
        rank: shoe.rank,
        name: shoe.name.trim(),
        brand: shoe.brand.trim(),
        affiliateUrl: affiliate.url,
        image: image.publicPath,
        bestFor: shoe.bestFor.trim(),
      });
    }
    if (errors.length > 0 || shoes.length !== 5) {
      return { ok: false as const, errors };
    }
    const payload = {
      weekLabel: input.weekLabel.trim(),
      updatedAt: input.updatedAt,
      shoes: shoes.sort((a, b) => a.rank - b.rank),
    };
    const persist = ctx.session.purpose !== "eval" && ctx.session.dryRun !== true;
    if (persist) {
      writeFileSync(paths.highlightsFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    }
    return {
      ok: true as const,
      path: "content/destaques-semana.json",
      persisted: persist,
      approvalLine: "aguardando aprovação humana (links)",
    };
  },
});
