---
description: >
  Escrever ou revisar rascunho do Pace no Preço em pt-BR: keyword do Google
  Brasil, frontmatter MDX, ranking com 5 tênis, placeholder de afiliado e
  foto do modelo exato. Use antes de write_post.
---

# SEO Blog pt-BR (Pace no Preço)

Skill do bloguio. A cópia para o Cursor no repo é `.cursor/skills/seo-blog-ptbr/SKILL.md`. O contrato dos arquivos é `CONTENT.md`.

## Quando usar

Antes de criar ou revisar `content/posts/*.mdx`. Não altera layout, componente nem `lib/`.

## Antes de escrever

1. Chame `list_posts`.
2. Leia `CONTENT.md` e, se for ranking, `content/posts/os-5-melhores-tenis-de-corrida.mdx` com `read_blog_file`.
3. Feche uma keyword principal (frase de busca BR), a intenção e 3 a 5 secundárias.
4. O slug novo não pode repetir slug já listado.

No schedule de posts, não espere confirmação: escolha o gap e escreva o rascunho. Não chame `write_highlights` nesse schedule. Se um humano pedir algo ambíguo fora do schedule, pergunte a keyword antes de gravar.

## Destaques da semana

O schedule `destaques-semana` roda na segunda. Leia `content/destaques-semana.json`, escolha 5 tênis de corrida no Brasil e grave com `write_highlights`. Exatamente 5. `affiliateUrl` só com o placeholder. Foto incerta vira `/images/shoes/pendente-<slug-do-nome>.jpg`. O rótulo da semana é calculado pela tool. Feche com `aguardando aprovação humana (links)`.

## Formato

Arquivo: `content/posts/<slug>.mdx`, gravado só por `write_post`.

- `title` com a keyword principal. Ranking começa com `Os 5 melhores`.
- A keyword entra de novo no primeiro parágrafo.
- `description` com 120 a 160 caracteres.
- `slug` kebab-case, sem acento, igual ao nome do arquivo.
- `publishedAt` e `updatedAt` em `YYYY-MM-DD`. O autor do Article é o site (`Pace no Preço` em `lib/site.ts`). Não invente campo `author`.
- `category`: `tenis`, `corrida`, `treino`, `iniciantes` ou `ofertas`.
- `draft: true`. A tool recusa `false`.
- `affiliateDisclosure: true`. Não escreva as palavras afiliado, comissão ou disclosure no texto visível.
- Ranking: exatamente 5 `shoes`, ranks 1 a 5, cada um com `name`, `brand`, `pros` (2 ou mais), `bestFor`. Sem `cons`.
- FAQ no frontmatter, 3 a 6 itens no ranking. Pergunta termina com `?`.
- Corpo em Markdown, sem H1. O card do tênis já cria o H2 `{rank}º lugar: {name}`.
- 2 a 4 links internos para slugs que existem. Se só houver um outro post, um link basta. Não invente slug.
- H2 ou H3 em pergunta quando o guia precisar. No ranking, o FAQ cobre as perguntas.

## Afiliado

`affiliateUrl` do rascunho:

`https://pendente.invalid/PENDENTE_LINK_AFILIADO`

Não use `meli.la` nem monte URL de produto. Se o Marcelo colou o link nesta conversa, passe a string exata em `linksInformadosPeloMarcelo` e no `affiliateUrl`. A gravação fica parada até uma pessoa aprovar a tool. CTA visível: "Ver preço" ou "Ver no Mercado Livre".

## Foto

`shoes[].image` tem de ser o modelo de `shoes[].name`.

- Arquivo que já existe: o nome do arquivo precisa conter os tokens do modelo (4 letras ou mais). `olympikus-corre.jpg` não serve para Challenger.
- Sem o arquivo certo: `/images/shoes/pendente-<slug-do-nome>.jpg`. Exemplo: nome `Olympikus Corre 4` vira `/images/shoes/pendente-olympikus-corre-4.jpg`.
- Capa que não existe: `/images/posts/pendente-<slug-do-post>.jpg`.
- `save_image` só com bytes do modelo exato, jpg ou png, lado mínimo 320px. Sem download. Sem Mercado Livre.

Sinalize foto pendente na resposta.

## O que não entra

Spec de drop, peso ou espuma sem fonte. Preço sem fonte. pt-PT. Lifestyle genérico. Post com `draft: false`.

## Resposta

Depois do `write_post` com `ok: true`, responda com keyword, intenção, formato, slug, path, três bullets e a linha `aguardando aprovação humana (links)`.
