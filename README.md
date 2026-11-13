# Pace no Preço — Blog

Site editorial de corrida e tênis (Next.js App Router + MDX), com SEO e links de afiliado do Mercado Livre.

## Setup

```bash
cd Blog
cp .env.example .env.local
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | desenvolvimento |
| `npm run build` | build de produção (valida frontmatter) |
| `npm run start` | serve o build |
| `npm run lint` | ESLint |

## Conteúdo (Grok)

Veja [CONTENT.md](./CONTENT.md). Posts ficam em `content/posts/*.mdx`.

## Deploy (Vercel)

Push em `main` publica em produção pela **integração Git da Vercel** (projeto `pace-no-preco-blog`, Root Directory `Blog`). Não há workflow de deploy no GitHub Actions. Publicação manual: `vercel deploy --prod --yes`.

Variáveis: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_URL`, `DATABASE_URL` e as do admin (ver `.env.example`).

Detalhes, medição de cliques e contexto dos anúncios: [docs/PROJETO.md](./docs/PROJETO.md).

Conta Vercel / GitHub: use `marcelohenriqueavs@gmail.com`.

## Estrutura

```
app/                 rotas e SEO (sitemap, robots)
components/          UI (header, shoe cards, CTAs)
content/posts/       artigos MDX
lib/                 schema Zod, content, seo
public/images/       assets
```
