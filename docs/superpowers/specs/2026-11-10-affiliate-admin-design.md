# Design: painel de links afiliados + destaques da semana

**Date:** 2026-11-10  
**Status:** approved (with publish-gate addendum)  
**Product:** Pace no Preço blog (Next.js App Router + MDX, Vercel)

## Decisions locked after review

- Affiliate paste example from Marcelo: `https://meli.la/1BHXJUZ` → allowlist must include **`meli.la`**, not only `mercadolivre.com.br`.
- Neon outage: public pages **fall back** to MDX / `destaques-semana.json` (stay up; possibly stale CTAs).
- Admin can **clear** an override so the shoe falls back to the MDX `affiliateUrl`.
- **Publish gate:** um post do Grok **não sobe no blog público** até Marcelo preencher os links afiliados de **todos** os tênis daquele post e clicar **Publicar** no admin.

## Intent and why

Marcelo precisa colar links de afiliado do Mercado Livre **manualmente** (compliance do programa) e atualizar os **5 destaques da semana**, sem editar MDX/JSON/git a cada troca. Links devem refletir no site **o mais rápido possível**, para o visitante não clicar em anúncio morto ou errado.

O Grok continua escrevendo posts em `content/posts/*.mdx`. O painel cobre a camada operacional (CTAs e home da semana). Edição completa de post fica fora do v1 (desejável depois, se o Grok não bastar).

## Goals

- Colar/atualizar `affiliateUrl` dos tênis de cada post sem mexer em código.
- Criar/editar os 5 destaques da semana (rótulo, campos dos tênis, links) sem mexer em `destaques-semana.json`.
- Publicar essas mudanças **quase na hora** no site em produção.
- **Gate de publicação:** post novo (Grok) só aparece no blog depois dos links afiliados preenchidos + ação Publicar.
- Manter CTAs com `rel="nofollow sponsored noopener noreferrer"` e hosts da allowlist (`meli.la`, `mercadolivre.com.br`).
- Usar um único admin (Marcelo), com acesso protegido.

## Non-goals (v1)

- CMS completo / editor de corpo MDX / FAQ / capa do post.
- Upload de imagens (continua path em `/public/...` ou URL absoluta).
- Multi-usuário, roles, auditoria rica, histórico de versões.
- Geração automática de link afiliado via API do Mercado Livre.
- Migrar posts para banco.

## Anti-goals

- Qualquer fluxo que “invente” ou scrape links afiliados.
- Painel público ou sem autenticação.
- Dependência de commit/deploy só para trocar um link (isso falha o requisito de atualização rápida).

## Constraints

- Stack atual: Next.js 16 App Router, React 19, Zod, conteúdo MDX + `content/destaques-semana.json`, deploy Vercel.
- Sem DB hoje — v1 introduz Neon (Postgres).
- Contrato do Grok (`CONTENT.md`): Grok só edita `content/`; painel não exige que o Grok mude de ferramenta.
- Links manuais gerados no painel oficial de afiliados do ML.

## Approaches considered

| Approach | Tradeoff | Decision |
|----------|----------|----------|
| **A. Neon + `/admin` no Next** | Update quase imediato; um pouco mais de setup (DB + auth) | **Escolhido** |
| B. Upstash/KV + mesmo painel | Mais leve no início; pior pra dados estruturados e fase 2 | Descartado |
| C. CMS externo (Sanity etc.) | UI pronta; outra ferramenta + híbrido estranho com MDX | Descartado |
| D. Admin que só edita git/JSON | Simples, mas update depende de deploy (minutos) — conflita com “o quanto antes” | Descartado |

**Product split (já decidido):** Grok no repo (MDX); painel para links + destaques. Não “tudo no CMS”.

## Design

### Mental model

```
MDX (texto + lista de tênis; Grok cria com draft: true)
        +
Neon overrides (affiliateUrl por tênis)
        +
Neon post_publications (liberação pública após links)
        +
Neon weekly highlights (home)
        →
páginas públicas (merge + filtro de publicação)
```

- **Posts:** frontmatter MDX continua canônico para nome, marca, imagem, pros, bestFor, rank. O banco só **sobrescreve** `affiliateUrl` quando existir override.
- **Destaques:** em produção, a **fonte da verdade é o Neon**. O arquivo `content/destaques-semana.json` vira seed/fallback para dev sem `DATABASE_URL`.
- **Publicação:** ver secção *Publish gate* abaixo.

### Data model (Neon)

**`affiliate_overrides`**

| column | notes |
|--------|--------|
| `id` | uuid pk |
| `post_slug` | text, not null |
| `shoe_name` | text, not null — match exato com `shoes[].name` do MDX |
| `affiliate_url` | text, not null — URL afiliada ML (ver allowlist abaixo) |
| `updated_at` | timestamptz |

Unique `(post_slug, shoe_name)`.

**Por que `shoe_name` e não `rank`:** se o Grok reordenar o ranking, o link não “troca de tênis” por acidente.

**`weekly_highlights`**

Uma linha ativa (ou tabela com um único documento JSON validado pelo mesmo shape de `weeklyHighlightsSchema`):

- `week_label` text
- `updated_at` timestamptz
- `shoes` jsonb — exatamente 5 itens no shape atual (`rank`, `name`, `brand`, `affiliateUrl`, `image`, `bestFor`)

Builder call: preferir uma row singleton (`id = 1`) com JSONB + validação Zod na API, em vez de normalizar 5 rows — menos código, mesmo schema do site.

**`post_publications`**

| column | notes |
|--------|--------|
| `post_slug` | text pk |
| `published_at` | timestamptz not null |

Row presente = Marcelo liberou o post no admin (depois dos links). Ausência = post **não** entra em listagens/rotas públicas (exceto grandfather — abaixo).

### Publish gate

Fluxo esperado:

1. Grok cria `content/posts/*.mdx` com `draft: true` e URLs placeholder nos tênis.
2. Deploy sobe o arquivo, mas o site **não lista** o post.
3. Marcelo abre `/admin` → preenche override `meli.la` (etc.) para **cada** tênis do post.
4. Botão **Publicar** só habilita quando `shoes.length === 0` **ou** todo `shoe.name` tem override com host na allowlist.
5. Publicar insere/atualiza `post_publications` — post aparece na hora, sem editar MDX/`draft`.

**Visibilidade pública (`isPostPublic`):**

- Se existe row em `post_publications` para o slug → **público** (mesmo com `draft: true` no MDX).
- Senão, se `draft === false` no MDX → **público** (**grandfather** dos posts já no ar antes deste feature).
- Senão → **oculto** (404 na rota do slug; fora de listagens, related, sitemap).

**Despublicar (v1):** opcional — botão “Despublicar” apaga a row; posts grandfather (`draft: false` sem row) continuam públicos até alguém setar `draft: true` no MDX (fora do painel). Builder call: incluir Despublicar só para rows em `post_publications`.

Admin lista posts em dois grupos: **Aguardando links/publicação** e **No ar**.

### Merge rules (site público)

1. `getPostBySlug` / listagens que expõem `shoes`: após ler MDX, buscar overrides daquele `post_slug`; para cada shoe, se houver override com o mesmo `name`, substituir `affiliateUrl`.
2. `getWeeklyHighlights`: se `DATABASE_URL` e row existir → usar Neon; senão → arquivo JSON (dev/fallback).
3. Validação de URL (Zod + allowlist de hosts) na escrita do admin e, de preferência, na leitura defensiva.

**Allowlist de hosts (v1), baseada no link real do painel de afiliados:**

- `meli.la` (short link oficial — ex. `https://meli.la/1BHXJUZ`)
- `mercadolivre.com.br`
- `www.mercadolivre.com.br`

Builder may add other clear Mercado Libre BR tracking hosts only if we hit a real paste that fails; do not open the allowlist to arbitrary domains.

### Caching / freshness

- Rotas que consomem overrides ou destaques **não podem** ficar em cache estático eterno.
- Builder call: `export const dynamic = "force-dynamic"` (ou `revalidate = 0` / `unstable_noStore`) nas páginas home, post e qualquer partial que leia esses dados; admin mutations escrevem direto no Neon — próximo request já vê o link novo.
- Não exigir rebuild da Vercel para trocar link.

### Resilience

- Se `DATABASE_URL` estiver setado mas o Neon falhar na leitura: **fallback** para MDX (posts) e `content/destaques-semana.json` (home). Logar o erro; não derrubar a página pública.
- Admin write paths: falha do Neon = erro explícito no save (não fingir sucesso).

### Clear override

- `PUT .../links` aceita URL vazia / flag de clear por `shoeName` → deleta a row de override.
- UI: ação “usar link do post (MDX)” ou campo limpo + salvar.

### Auth (v1)

- Um único operador.
- Senha em env (`ADMIN_PASSWORD` ou hash `ADMIN_PASSWORD_HASH` — builder escolhe o mais seguro simples).
- Sessão via cookie httpOnly assinado (`ADMIN_SESSION_SECRET`).
- Rotas `/admin/*` e APIs de mutação exigem sessão; sem multi-tenant.
- Sem OAuth no v1.

### Admin UX (v1)

Rotas sob `/admin` (UI simples, visual alinhado ao site o bastante para não parecer quebrado; não é landing).

1. **Login** — senha.
2. **Destaques da semana** — editar `weekLabel` + 5 tênis (campos atuais) + salvar. Preview mínimo opcional.
3. **Links por post** — lista posts (slugs do filesystem); ao abrir um post, lista `shoes` do MDX com campo de URL (valor atual = override ?? MDX) + salvar; indicador de links faltando; **Publicar** / **Despublicar**.

Fora do v1: editor de markdown, upload de imagem, bulk import.

### APIs

- `POST /admin/login`, `POST /admin/logout`
- `GET/PUT /api/admin/highlights` (auth)
- `GET /api/admin/posts` — metadados leves + shoes do MDX + overrides + publish state (auth)
- `PUT /api/admin/posts/[slug]/links` — body: lista `{ shoeName, affiliateUrl }` (auth)
- `POST /api/admin/posts/[slug]/publish` — 409 se links incompletos; senão upsert `post_publications` (auth)
- `DELETE /api/admin/posts/[slug]/publish` — remove row (auth)

Leituras públicas **não** expõem endpoints de override crus; o merge acontece no server component / `lib/`.

### Env

- `DATABASE_URL` — Neon
- `ADMIN_PASSWORD` (ou hash)
- `ADMIN_SESSION_SECRET`
- Existentes: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_URL`

### Seed / migração

- Na primeira subida com DB: seed de `weekly_highlights` a partir de `content/destaques-semana.json` se a tabela estiver vazia.
- Overrides começam vazios; MDX placeholders continuam até Marcelo colar o link real no admin.
- Atualizar `CONTENT.md` / skill de blog: Grok **sempre** cria posts novos com `draft: true` e pode deixar URL placeholder; **link afiliado real + Publicar** no admin. Posts só entram no blog público após esse passo.

### Fase 2 (só registrar, não construir agora)

- Edição leve de campos do post (título, description, shoes metadata) no painel.
- Upload de imagem.

## Left to the builder

- Cliente Neon exato (`@neondatabase/serverless` vs outro) e pasta de migrations.
- Detalhe do cookie/session helper.
- Layout visual fino do `/admin`.
- Se seed roda em migration SQL, script one-shot, ou lazy no primeiro `GET` de highlights.
- Testes mínimos que fizerem sentido (validação de host ML, merge de override, publish gate).

## Success looks like

1. Grok sobe um post em draft → visitante **não** vê na home/lista/sitemap.
2. Marcelo cola os `meli.la` de cada tênis no `/admin`, clica **Publicar** → post e CTAs corretos no ar em segundos.
3. Troca de link depois disso atualiza na hora, sem commit/deploy, sem o Grok remarcar frontmatter só por causa do link.
