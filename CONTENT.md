# Conteúdo do blog (contrato para o Grok)

O Grok (ou qualquer editor) deve **só criar/editar arquivos em `content/`**. Não alterar componentes, layout ou tokens visuais.

## Público e pesquisa: Brasil primeiro

Todo conteúdo, keyword research e recomendação de tênis assume **público no Brasil**.

- Idioma: **português do Brasil** (pt-BR). Nunca pt-PT (“telemóvel”, “desporto” etc.)
- Busca: pense no Google BR. Títulos e slugs com o jeito que o brasileiro pesquisa (`tênis de corrida`, `melhor tênis para começar a correr`, `tênis barato mercado livre`)
- Compra: links só do **Mercado Livre `.com.br`**. Preço em real (R$), quando citar
- Modelos: priorize o que se encontra fácil no BR (Olympikus, Fila, ASICS, Mizuno, Adidas, Nike, New Balance etc. com oferta local). Evite modelos US-only / Europa-only sem versão vendida aqui
- Contexto: calor, asfalto urbano, prova de rua BR, custo-benefício, iniciação. Não assumir clima/loja dos EUA
- Datas e cultura: formato BR (`10 de novembro de 2026`), referências locais quando fizer sentido
- SEO: intenção comercial + informacional BR; não copiar rankings gringos sem adaptar disponibilidade e preço no Brasil

## Destaques da semana (home)

Arquivo: [`content/destaques-semana.json`](./content/destaques-semana.json)

Sempre **exatamente 5 tênis**. Atualize `weekLabel`, `updatedAt`, imagens e links quando as ofertas mudarem.

```json
{
  "weekLabel": "10 a 16 de novembro",
  "updatedAt": "2026-11-10",
  "shoes": [
    {
      "rank": 1,
      "name": "Modelo",
      "brand": "Marca",
      "affiliateUrl": "https://www.mercadolivre.com.br/...",
      "image": "/images/shoes/modelo.jpg",
      "bestFor": "perfil do corredor"
    }
  ]
}
```

## Posts do blog

## Como publicar um post

1. Crie `content/posts/meu-slug.mdx`
2. Preencha o frontmatter YAML (schema abaixo)
3. Escreva o corpo em Markdown/MDX
4. Coloque imagens em `public/images/posts/` e `public/images/shoes/`
5. Rode `npm run build` (frontmatter inválido quebra o build)

## Frontmatter obrigatório

```yaml
title: "Título SEO claro"
slug: titulo-seo-claro
description: "Meta description de 120-160 caracteres"
publishedAt: 2026-11-10
updatedAt: 2026-11-10
category: tenis
tags: [ranking, iniciante]
coverImage: /images/posts/exemplo.jpg
affiliateDisclosure: true
draft: false
shoes:
  - rank: 1
    name: "Nome do modelo"
    brand: Marca
    affiliateUrl: "https://www.mercadolivre.com.br/..."
    image: /images/shoes/modelo.jpg
    pros: ["ponto forte"]
    bestFor: "perfil do corredor"
faq:
  - question: "Pergunta frequente?"
    answer: "Resposta clara em pt-BR."
```

### Regras

- `slug` em kebab-case (`a-z`, `0-9`, hífens)
- `affiliateUrl` deve ser URL válida do Mercado Livre (link de compra real)
- Não mencionar “afiliado”, “comissão” ou “disclosure” no texto visível ao leitor
- Não inventar specs técnicas (drop, peso, espuma) sem fonte; diga para conferir a ficha
- Rankings: use a lista `shoes` no frontmatter. O site renderiza os cards automaticamente
- Não usar campo `cons` / “Atenção” nos tênis; só `pros` e `bestFor`
- Tom: direto, útil, em português do Brasil. Sem hype vazio
- SEO: um H1 via `title`; no corpo use H2/H3; descrição única por post
- CTAs: “Ver preço”, “Ver no Mercado Livre”, nunca “link de afiliado”
- FAQ: use `faq` no frontmatter das resenhas (3 a 6 perguntas). O accordion aparece no fim do post; bom para SEO (FAQPage)

## Componentes MDX disponíveis

No corpo você pode usar:

- `<AffiliateCta href="..." label="Ver preço" />`
- `<ShoeCard />` (preferível deixar os cards virem do frontmatter `shoes`)

## Categorias sugeridas

`tenis`, `corrida`, `treino`, `iniciantes`, `ofertas`
