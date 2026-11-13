# Pace no Preço — guia do projeto (para humanos e agentes)

Leia este arquivo primeiro. Ele resume o que o projeto é, como publica, como mede resultado e as armadilhas já encontradas. Atualize-o quando algo disso mudar.

## 1. O que é

Blog editorial de corrida e tênis (Next.js App Router + MDX) com links de afiliado do Mercado Livre, **mais** a landing page `/grupo`, que existe para levar gente ao **grupo de WhatsApp "Pace no Preço"** (promoções de tênis de corrida, comissão de afiliado ~16%).

A `/grupo` é o **destino dos anúncios pagos da Meta (Facebook/Instagram)**. A Meta não aceita `chat.whatsapp.com` como destino de Site, por isso o anúncio aponta para `https://pace-no-preco-blog.vercel.app/grupo`, que tem o botão "Entrar no grupo" (sem redirecionamento automático).

- Produção: https://pace-no-preco-blog.vercel.app
- Repositório: https://github.com/MarceloHenrique13/pace-no-preco-blog (branch `main`)
- Pasta local: `Pace no Preço/Blog` (o resto de `Pace no Preço/` são criativos de vídeo, fora deste app)

## 2. Mapa do código

| Caminho | O que tem |
| --- | --- |
| `app/grupo/page.tsx` | Landing do grupo. Botões usam `GroupLink` (rastreia clique). |
| `app/api/track/route.ts` | Recebe o clique e grava em `page_events`. Sempre responde 204. |
| `app/admin/(panel)/page.tsx` | Início do admin, com o contador de cliques. |
| `components/group-link.tsx` | Link client-side que dispara o rastreamento (`sendBeacon`). |
| `components/vercel-analytics.tsx` | Script do Vercel Web Analytics (visitas). |
| `components/admin/group-click-stats.tsx` | Painel do contador no admin. |
| `lib/page-events.ts` | Consulta de cliques (hoje, 7 dias, total, por botão, por anúncio). |
| `lib/db.ts` | Cliente Neon (`getSql()` retorna `null` sem `DATABASE_URL`). |
| `db/schema.sql` | Esquema das tabelas (inclui `page_events`). |
| `content/posts/*.mdx` | Artigos. Regras de conteúdo em `CONTENT.md`. |

## 3. Publicação (deploy)

- **Como publica:** integração Git da Vercel. Todo push em `main` publica sozinho em Produção (~30–60 s).
- **Projeto Vercel:** `pace-no-preco-blog`, escopo `marcelo-henrique`. IDs (não secretos) em `.vercel/project.json`.
- **Não existe workflow de deploy no GitHub Actions.** Havia um (`deploy-production.yml`) que falhava na etapa `vercel pull` por segredos ausentes; foi removido em favor da integração Git. Não recriar.
- **Publicação manual (reserva):** na pasta `Blog`, `vercel deploy --prod --yes` (CLI já autenticada na conta do dono).
- **Conferir se publicou:** `vercel ls pace-no-preco-blog` (status `Ready`) ou abrir a URL.
- Se o repositório for reconectado: `vercel git connect <url-do-repo>` pode falhar até o app da Vercel ter acesso ao repo no GitHub (feito no painel: Settings → Git).

## 4. Variáveis de ambiente

Ver `.env.example`. `.env.local` fica fora do git. Em produção ficam no painel da Vercel.
Principais: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_URL` (link do convite do grupo), `DATABASE_URL` (Neon), `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `BLOB_*`.

> Atenção: o `DATABASE_URL` do `.env.local` aponta para o **mesmo banco de produção**. Qualquer teste local que grave dados grava em produção. Use marcadores de teste e apague (ver seção 5).

## 5. Medição: visitas e cliques

Objetivo: saber quantos visitantes da `/grupo` clicam em "Entrar no grupo".

- **Visitas:** Vercel Web Analytics. O script é carregado em `components/vercel-analytics.tsx` (renderizado no `app/layout.tsx`). Resultado no painel da Vercel → projeto → Analytics.
  - **Não use `npm i @vercel/analytics`**: dá `ERESOLVE` (peer opcional `@sveltejs/kit`/vite conflita com o vitest). O componente próprio faz o mesmo que o pacote.
- **Cliques no botão:** *não* vêm da Vercel. Eventos personalizados da Vercel só existem em plano pago, então o clique é gravado no nosso banco:
  1. `GroupLink` (client) chama `POST /api/track` com `{event:"group_click", placement, path, utmContent, utmCampaign}` via `sendBeacon`.
  2. `/api/track` valida (só o evento `group_click`, ignora bots), cria a tabela `page_events` se não existir e insere uma linha.
  3. O admin (`/admin`) lê com `lib/page-events.ts` e mostra Hoje / 7 dias / Total / por botão (`topo`, `rodape`) / por anúncio (`utm_content`).
- **Taxa de clique** = cliques no botão ÷ visitantes de `/grupo` (painel da Vercel).
- **Por anúncio:** só funciona se o anúncio da Meta tiver `?utm_content=...` na URL (parâmetros de URL do anúncio, ex.: `utm_content={{ad.name}}`). Editar anúncio reinicia a análise/aprendizado da Meta; fazer só quando fizer sentido.
- **Testar sem sujar os dados:** enviar um POST com `placement` começando por `teste` e depois apagar: `DELETE FROM page_events WHERE placement LIKE 'teste%'`.
- Meta Pixel (evento `Lead` no clique) **ainda não está instalado**; é o próximo passo natural (ver seção 6).

## 6. Contexto de marketing (anúncios Meta)

- Conta de anúncios própria (BRL), campanha de **Tráfego**, destino Site = `/grupo`.
- Dois conjuntos de teste, R$ 12/dia cada, Brasil 21–55, posicionamentos manuais (Feed e Reels do Instagram e Facebook): `Brasil 21-55 | Auto - 01` e `- 02`, cada um com um criativo de vídeo diferente (criativos em `../editor_criativos/criativos/`).
- Regra do teste: **não mexer por 3 dias** (orçamento, público, criativo).
- Referências de leitura: CTR do link > 1% saudável; CPC do link < R$ 0,80 bom; meta de custo por membro R$ 2–3 (gasto ÷ novos membros do grupo).
- Observação: no início houve CTR muito alto (5–8%) com poucos membros; a investigação passou por medir visitas reais e cliques no botão (itens da seção 5).
- Pendências conhecidas: aviso de afiliado visível na página e na descrição do grupo; domínio próprio (permite link de exibição no anúncio e resolve o uso comercial no plano Hobby da Vercel); Pixel + evento `Lead`.
- Texto de anúncio: sempre no passado ("já achamos…"), sem prometer preço atual, sem logos de marca.

## 7. Armadilhas

- **Next.js 16:** APIs diferem do que modelos conhecem. Ler `node_modules/next/dist/docs/` antes de mexer em rotas/APIs (ver `AGENTS.md`).
- **Plano Hobby da Vercel:** sem eventos personalizados de Analytics; uso comercial é tecnicamente proibido (migrar para domínio próprio/plano pago).
- **Avisos de LF/CRLF** do git no Windows são normais.
- **Conteúdo do Cursor/Grok** entra por PRs em branches `cursor/*`; após merge, `git pull --rebase origin main` antes de dar push.

## 8. Favicon

Ícone de tênis em movimento (Phosphor `SneakerMove`, branco sobre `#1b3d2f`). Fonte: `app/icon.svg`. `app/apple-icon.png` e `app/favicon.ico` são gerados dele: `node scripts/generate-icons.mjs` (rode de novo se mudar o SVG).

## 9. Comandos úteis

```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm test             # vitest
npx tsc --noEmit     # tipos
vercel ls pace-no-preco-blog   # últimos deploys
```
