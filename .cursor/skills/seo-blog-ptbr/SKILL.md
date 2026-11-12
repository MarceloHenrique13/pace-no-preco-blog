---
name: seo-blog-ptbr
description: >
  Escrever ou revisar posts do blog Pace no Preço em português do Brasil,
  com keyword research, estrutura SEO, frontmatter MDX do projeto, meta
  description, slug, links internos, alt e JSON-LD (Article/FAQPage).
  Use ao criar, editar ou auditar conteúdo de posts do blog.
---

# SEO Blog pt-BR (Pace no Preço)

## Quando usar

Criar ou revisar posts em `content/posts/*.mdx`. Não altera layout/componentes
salvo se o usuário pedir correção técnica à parte.

## Idioma e pesquisa

- Português do Brasil natural. Sem tradução literal do inglês; sem pt-PT.
- Use termos que o brasileiro pesquisa (ex.: `tênis de corrida`, `melhor tênis
  para começar a correr`, `tênis barato mercado livre`).
- Público no Brasil; preços em R$; links de compra só Mercado Livre `.com.br`.

## Antes de escrever

Defina e confirme com o usuário se estiver ambíguo:

1. **Palavra-chave principal**
2. **Intenção de busca** (informacional, comercial, comparativa)
3. **3 a 5 palavras-chave secundárias**

## Estrutura do post

1. Título com a palavra-chave principal
2. Introdução direta: resposta útil logo no início
3. H2/H3 preferencialmente em formato de pergunta
4. FAQ no final (frontmatter `faq`, 3–6 itens)
5. Conclusão curta

## Requisitos SEO por post

- **Meta description** de 120 a 160 caracteres
- **Slug** sem acento, kebab-case (`a-z`, `0-9`, hífens)
- **2 a 4 links internos** para posts que existem de verdade em
  `content/posts/` (nunca inventar slug)
- **Imagem de capa** com `coverImage` e alt descritivo no componente/contexto
- **Data de publicação** e **data de atualização** no frontmatter. O autor do Article é o do site (`Pace no Preço` em `lib/site.ts`); o MDX não tem campo `author`
- Citar fontes confiáveis; **nunca inventar** dados ou estatísticas
- Specs técnicas (drop, peso, espuma) e preço: só com fonte pública fora do Mercado Livre. Sem fonte, não inventar e orientar a conferir a ficha
- Não acessar, raspar ou baixar dado ou imagem de página do Mercado Livre

## Formato do projeto

Arquivo: `content/posts/<slug>.mdx`

```yaml
title: "Título com a keyword principal"
slug: slug-sem-acento
description: "Meta description de 120 a 160 caracteres"
publishedAt: YYYY-MM-DD
updatedAt: YYYY-MM-DD
category: tenis
tags: [tag1, tag2]
coverImage: /images/posts/arquivo.jpg
affiliateDisclosure: true
draft: true
shoes: []   # opcional; cards renderizados pelo site
faq:
  - question: "Pergunta?"
    answer: "Resposta em pt-BR."
```

Posts **novos** sempre com `draft: true`. Não inventar `meli.la` nem URL de
`mercadolivre.com.br`. Em `affiliateUrl`, usar
`https://pendente.invalid/PENDENTE_LINK_AFILIADO` (o schema exige URL; o token
solto faz o post ser ignorado e ele não aparece no `/admin`). Link real só se
o Marcelo informar a URL. Ele confere e clica Publicar no `/admin`.

Ranking no formato "Os 5 melhores…": exatamente 5 itens em `shoes`. A foto de
`shoes[].image` tem de ser o modelo de `shoes[].name` (o alt do card é
`marca + nome`). Sem o arquivo certo, usar
`/images/shoes/pendente-<slug-do-nome>.jpg` e sinalizar. Não reutilizar a foto
de outro modelo.

Corpo em Markdown/MDX. H1 vem do `title` (não repetir H1 no corpo).

O site já injeta JSON-LD de **Article**, **ItemList** (se houver `shoes`) e
**FAQPage** (se houver `faq`) em `app/blog/[slug]/page.tsx` via `lib/seo.ts`.
Ao escrever o post, preencha frontmatter e FAQ para alimentar esse schema;
não invente markup fora do contrato.

Contrato completo: `CONTENT.md`. Schema Zod: `lib/schema.ts`.

## Tom e afiliados

- Tom direto e útil; sem hype vazio
- CTAs: “Ver preço” / “Ver no Mercado Livre”
- Não mencionar afiliado, comissão ou disclosure no texto visível
- `draft: true` em post novo; link afiliado real + Publicar no `/admin`

## Checklist final

- [ ] Keyword no `title`, no H1 (via title) e no primeiro parágrafo
- [ ] `description` entre 120 e 160 caracteres
- [ ] Slug kebab-case sem acento
- [ ] 2–4 links internos reais
- [ ] Capas/imagens com alt descritivo
- [ ] `faq` preenchido (quando fizer sentido) para FAQPage
- [ ] `publishedAt` / `updatedAt` e autor claros
- [ ] Sem dados inventados; fontes citadas quando houver números
