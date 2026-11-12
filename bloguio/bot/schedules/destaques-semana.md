---
cron: "0 11 * * 1"
---

Atualize os destaques da semana do Pace no Preço. Não escreva post. Não copie este pedido para o JSON.

O cron é 11:00 UTC, que é 08:00 em America/Sao_Paulo (UTC−3, sem horário de verão). Dispara toda segunda.

1. Leia content/destaques-semana.json com read_blog_file.
2. Escolha 5 tênis de corrida fáceis de achar no Brasil. Varie em relação à lista que já está no arquivo. Nada fora de corrida.
3. Chame write_highlights com exatamente 5 itens. affiliateUrl só em https://pendente.invalid/PENDENTE_LINK_AFILIADO. Deixe linksInformadosPeloMarcelo vazio. Sem a foto do modelo exato no disco, use /images/shoes/pendente-<slug-do-nome>.jpg. A tool grava o rótulo da semana (segunda a domingo) e a data de hoje nesse fuso.
4. Se a tool recusar, corrija o payload. Não invente link do Mercado Livre.
5. Responda com o rótulo da semana, os 5 modelos, o path content/destaques-semana.json, o que ficou com foto pendente, e a última linha exatamente: aguardando aprovação humana (links).

Não publique, não faça commit, push nem deploy. Os links reais o Marcelo cola no /admin.
