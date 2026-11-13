<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Projeto Pace no Preço — leia antes de analisar ou alterar

**Comece por [`docs/PROJETO.md`](./docs/PROJETO.md)**: o que o projeto é, mapa do código, como publica (integração Git da Vercel, sem GitHub Actions), como mede visitas e cliques no botão do grupo (`/grupo`, `/api/track`, tabela `page_events`, contador no `/admin`), contexto dos anúncios da Meta e armadilhas conhecidas.

Regras rápidas:
- Push em `main` publica em produção sozinho. Rodar `npm run build` e `npm test` antes.
- O `DATABASE_URL` local é o banco de **produção**: testes que gravam dados devem usar marcador `teste*` e ser apagados.
- Não rodar `npm i @vercel/analytics` (conflito de peers); o componente `components/vercel-analytics.tsx` já cobre.
- Atualize `docs/PROJETO.md` quando mudar deploy, medição ou os anúncios.
