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

- **Meta description** até ~155 caracteres
- **Slug** sem acento, kebab-case (`a-z`, `0-9`, hífens)
- **2 a 4 links internos** para posts que existem de verdade em
  `content/posts/` (nunca inventar slug)
- **Imagem de capa** com `coverImage` e alt descritivo no componente/contexto
- **Autor** identificado, **data de publicação** e **data de atualização**
- Citar fontes confiáveis; **nunca inventar** dados ou estatísticas
- Specs técnicas (drop, peso, espuma): só com fonte; senão orientar a conferir a ficha

## Formato do projeto

Arquivo: `content/posts/<slug>.mdx`

```yaml
title: "Título com a keyword principal"
slug: slug-sem-acento
description: "Meta description até ~155 caracteres"
publishedAt: YYYY-MM-DD
updatedAt: YYYY-MM-DD
category: tenis
tags: [tag1, tag2]
coverImage: /images/posts/arquivo.jpg
affiliateDisclosure: true
draft: false
shoes: []   # opcional; cards renderizados pelo site
faq:
  - question: "Pergunta?"
    answer: "Resposta em pt-BR."
```

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

## Checklist final

- [ ] Keyword no `title`, no H1 (via title) e no primeiro parágrafo
- [ ] `description` ≤ ~155 caracteres
- [ ] Slug kebab-case sem acento
- [ ] 2–4 links internos reais
- [ ] Capas/imagens com alt descritivo
- [ ] `faq` preenchido (quando fizer sentido) para FAQPage
- [ ] `publishedAt` / `updatedAt` e autor claros
- [ ] Sem dados inventados; fontes citadas quando houver números
