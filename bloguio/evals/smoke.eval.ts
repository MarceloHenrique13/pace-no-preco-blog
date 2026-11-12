import { defineEval, includes } from "@grok/agent-sdk/evals";

const PLACEHOLDER = "https://pendente.invalid/PENDENTE_LINK_AFILIADO";
const TAKEN_SLUG = "os-5-melhores-tenis-de-corrida";

function isSmokePost(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const post = value as Record<string, unknown>;
  if (post.ok !== true || post.draft !== true || post.frontmatterValid !== true) return false;
  if (post.format !== "ranking" || post.shoeCount !== 5 || post.persisted !== false) return false;
  if (typeof post.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) return false;
  if (post.slug === TAKEN_SLUG || post.path !== `content/posts/${post.slug}.mdx`) return false;
  return Array.isArray(post.affiliateUrls) && post.affiliateUrls.every((url) => url === PLACEHOLDER) && post.affiliateUrls.length === 5;
}

export default defineEval({
  tags: ["smoke"],
  description: "Ranking draft com frontmatter válido, 5 tênis, slug novo e sem link de afiliado real.",
  async test(t) {
    await t.send(
      [
        "Gere agora um rascunho de ranking.",
        "Keyword principal, copie exatamente: melhor tênis de corrida para iniciante.",
        "Intenção: comercial.",
        "O title tem de começar com Os 5 melhores e conter essa keyword inteira.",
        "Slug novo, em kebab-case, diferente de os-5-melhores-tenis-de-corrida.",
        "Não use link do Mercado Livre nem meli.la. affiliateUrl só com o placeholder.",
        "Não baixe imagem e não chame save_image nem write_highlights.",
        "Chame list_posts e depois write_post.",
        "Feche a resposta com a linha: aguardando aprovação humana (links).",
      ].join("\n"),
    );
    t.succeeded();
    t.calledTool("list_posts");
    t.calledTool("write_post", {
      status: "completed",
      output: (value) => isSmokePost(value),
    });
    t.notCalledTool("write_highlights");
    t.notCalledTool("save_image");
    t.check(t.reply, includes("aguardando aprovação humana (links)"));
  },
});
