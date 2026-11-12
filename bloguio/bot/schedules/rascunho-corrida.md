---
cron: "0 12 * * 1,3,5"
---

Gere um rascunho novo do Pace no Preço. Não copie este pedido para o post.

O cron é 12:00 UTC, que é 09:00 em America/Sao_Paulo (UTC−3, sem horário de verão). Dispara na segunda, na quarta e na sexta.

1. Carregue a skill seo-blog-ptbr.
2. Chame list_posts e leia CONTENT.md. Não repita slug existente.
3. Escolha uma keyword de corrida com busca real no Google Brasil e um gap no inventário. Se a intenção for comercial ou comparativa, faça ranking "Os 5 melhores…". Senão, um guia. Nada fora de corrida.
4. Chame write_post com draft true, exatamente 5 shoes no ranking, e affiliateUrl só em https://pendente.invalid/PENDENTE_LINK_AFILIADO. Deixe linksInformadosPeloMarcelo vazio. Sem foto confirmada do modelo, use o caminho pendente e sinalize. Não chame save_image nem write_highlights.
5. Se write_post recusar, corrija o payload. Não grave link do Mercado Livre para "destravar".
6. Responda com keyword, intenção, formato, slug, path, três bullets e a última linha exatamente: aguardando aprovação humana (links).

Não publique, não mude draft para false, não faça commit, push nem deploy.
