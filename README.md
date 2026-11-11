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

1. Importe o repositório do **Pace no Preço**
2. Defina **Root Directory** = `Blog`
3. Variáveis: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_URL`
4. Deploy

Conta Vercel / GitHub: use `marcelohenriqueavs@gmail.com`.

## Estrutura

```
app/                 rotas e SEO (sitemap, robots)
components/          UI (header, shoe cards, CTAs)
content/posts/       artigos MDX
lib/                 schema Zod, content, seo
public/images/       assets
```
