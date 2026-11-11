# Affiliate Admin + Publish Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Marcelo paste Mercado Livre affiliate links and edit weekly highlights in `/admin`, with near-instant public updates, and keep Grok posts off the public blog until every shoe link is filled and he clicks Publicar.

**Architecture:** Keep MDX as the source of post copy and shoe metadata. Store affiliate URL overrides, weekly highlights, and publish rows in Neon. Public `lib/content` becomes async: merge overrides, resolve highlights from DB with file fallback, and filter posts with `isPostPublic`. `/admin` uses a password cookie session and server APIs.

**Tech Stack:** Next.js 16 App Router, React 19, Zod, `@neondatabase/serverless`, Vitest (unit tests for pure helpers), Vercel + Neon.

**Spec:** `docs/superpowers/specs/2026-11-10-affiliate-admin-design.md`

## Global Constraints

- Affiliate hosts allowlist only: `meli.la`, `mercadolivre.com.br`, `www.mercadolivre.com.br` (example: `https://meli.la/1BHXJUZ`).
- Manual affiliate links only — no scrape/auto-generation.
- Neon read failure on public pages → fall back to MDX / `content/destaques-semana.json`; admin writes fail visibly.
- Grok keeps writing MDX under `content/`; new posts use `draft: true`; real links + Publicar live in admin.
- Do not commit unless Marcelo explicitly asks (user rule overrides plan commit steps).
- Git identity when committing: `git -c user.name="Marcelo Henrique" -c user.email=marcelohenriqueavs@gmail.com` — never FIAP email.

## Review Focus

- Paste of `https://meli.la/1BHXJUZ` must save; random host (e.g. `amazon.com.br`) must reject — covered in Task 2.
- Draft MDX post without `post_publications` row must stay off list/detail/sitemap; grandfather `draft: false` without row stays public — Task 3.
- Publicar with a missing shoe override returns 409 and does not insert — Task 5.
- Neon throw on public highlight/override read serves file/MDX fallback, not 500 — Task 4.
- Clearing an override removes the row and CTAs fall back to MDX URL — Task 5.

## File map

| File | Responsibility |
|------|----------------|
| `lib/affiliate-url.ts` | Allowlist parse/validate |
| `lib/publish.ts` | `isPostPublic`, `allShoesHaveOverrides` |
| `lib/db.ts` | Neon SQL client (no-op/null when no `DATABASE_URL`) |
| `db/schema.sql` | Tables: `affiliate_overrides`, `weekly_highlights`, `post_publications` |
| `lib/admin-auth.ts` | Password verify + signed httpOnly session cookie |
| `lib/affiliate-store.ts` | CRUD overrides, highlights, publications |
| `lib/content.ts` | Async reads + merge + public filter + highlight fallback |
| `app/admin/**` | Login, highlights form, post links + Publicar UI |
| `app/api/admin/**` | Authenticated JSON APIs |
| `middleware.ts` (or layout guard) | Protect `/admin` except login |
| `CONTENT.md`, `.cursor/skills/seo-blog-ptbr/SKILL.md` | Grok: `draft: true`, placeholders OK |
| `vitest.config.ts`, `lib/*.test.ts` | Unit tests |
| `.env.example` | `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` |
| Call sites: `app/page.tsx`, `app/blog/**`, `app/categorias/**`, `app/sitemap.ts` | `await` + `dynamic = "force-dynamic"`; drop static-only assumptions |

---

### Task 1: Neon schema + DB client

**Files:**
- Create: `db/schema.sql`
- Create: `lib/db.ts`
- Modify: `.env.example`
- Modify: `package.json` (add `@neondatabase/serverless`)

**Interfaces:**
- Produces: `getSql(): neon query function | null` — returns null when `DATABASE_URL` missing
- Produces tables exactly as spec: `affiliate_overrides(post_slug, shoe_name, affiliate_url, updated_at)` unique `(post_slug, shoe_name)`; `weekly_highlights` singleton `id=1` with `week_label`, `updated_at`, `shoes jsonb`; `post_publications(post_slug pk, published_at)`

- [ ] **Step 1: Add dependency and env keys**

Add `@neondatabase/serverless`. Append to `.env.example`:
`DATABASE_URL=`, `ADMIN_PASSWORD=`, `ADMIN_SESSION_SECRET=`

- [ ] **Step 2: Write `db/schema.sql` and `lib/db.ts`**

`getSql()` reads `process.env.DATABASE_URL`; if absent return `null`.

- [ ] **Step 3: Verify client loads locally**

Run: `npx tsc --noEmit` (or project typecheck if available)  
Expected: no errors from new files

---

### Task 2: Affiliate URL allowlist + publish helpers (TDD)

**Files:**
- Create: `lib/affiliate-url.ts`
- Create: `lib/affiliate-url.test.ts`
- Create: `lib/publish.ts`
- Create: `lib/publish.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (`vitest`, script `"test": "vitest run"`)

**Interfaces:**
- Produces: `isAllowedAffiliateUrl(url: string): boolean`
- Produces: `parseAffiliateUrl(url: string): URL` throws if invalid/not allowlisted
- Produces: `isPostPublic(post: { slug: string; draft: boolean }, publishedSlugs: Set<string>): boolean`
- Produces: `allShoesHaveOverrides(shoeNames: string[], overrideNames: Set<string>): boolean`

- [ ] **Step 1: Write failing tests**

`affiliate-url.test.ts`:
- `isAllowedAffiliateUrl("https://meli.la/1BHXJUZ") === true`
- `isAllowedAffiliateUrl("https://www.mercadolivre.com.br/foo") === true`
- `isAllowedAffiliateUrl("https://amazon.com.br/x") === false`

`publish.test.ts`:
- draft + not in set → false
- draft + in set → true
- `draft: false` + not in set → true (grandfather)
- `allShoesHaveOverrides(["A","B"], new Set(["A"])) === false`
- `allShoesHaveOverrides(["A","B"], new Set(["A","B"])) === true`
- `allShoesHaveOverrides([], new Set()) === true`

- [ ] **Step 2: Run tests — expect fail**

Run: `npm test`  
Expected: FAIL (modules missing)

- [ ] **Step 3: Implement helpers**

Hosts: exact hostname match on allowlist (lowercase). `isPostPublic` per spec.

- [ ] **Step 4: Run tests — expect pass**

Run: `npm test`  
Expected: PASS

---

### Task 3: Affiliate store + async content merge/filter

**Files:**
- Create: `lib/affiliate-store.ts`
- Modify: `lib/content.ts`
- Create: `lib/content-publish.test.ts` (pure filter/merge helpers exported for test if needed)
- Modify: `app/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/categorias/[slug]/page.tsx`, `app/sitemap.ts`
- Modify: any SEO helpers that assume sync post lists only if required by call sites

**Interfaces:**
- Consumes: `getSql`, `isAllowedAffiliateUrl`, `isPostPublic`
- Produces:
  - `listOverridesForPost(slug: string): Promise<Map<string, string>>` name→url (empty on no DB / error)
  - `listPublishedSlugs(): Promise<Set<string>>` (empty on no DB / error)
  - `getWeeklyHighlightsFromStore(): Promise<WeeklyHighlights | null>`
  - `upsertOverrides(slug, items: { shoeName: string; affiliateUrl: string | null }[]): Promise<void>` null/empty url deletes
  - `saveWeeklyHighlights(data: WeeklyHighlights): Promise<void>`
  - `publishPost(slug: string): Promise<void>` / `unpublishPost(slug: string): Promise<void>`
- Change `getAllPosts` / `getPostBySlug` / `getWeeklyHighlights` / related helpers to **async**; public default excludes non-public posts; `getPostBySlug(slug, { forAdmin?: boolean })` for admin may include drafts/unpublished
- Merge: after MDX parse, replace `shoe.affiliateUrl` when override map has `shoe.name`
- Highlights: store row if present, else file; on DB error → file. Lazy seed: if DB connected and table empty, insert from file once (builder choice OK inside store)

- [ ] **Step 1: Write test for merge + visibility filter**

Export small pure `applyAffiliateOverrides(shoes, map)` and assert name match replaces URL only for that shoe.

- [ ] **Step 2: Implement store + async content**

On DB errors in read paths: `console.error` + empty overrides / file highlights / empty published set (grandfather still works via `draft: false`).

- [ ] **Step 3: Update all App Router call sites to `await`**

Remove `generateStaticParams` from `app/blog/[slug]/page.tsx` (or make it return `[]`) and add `export const dynamic = "force-dynamic"` on home, blog list, blog slug, categorias, sitemap consumers as needed so links/publish update without rebuild.

Replace `if (!post || post.draft) notFound()` with public check via async content API that already filters (admin-only path separate).

- [ ] **Step 4: Run `npm test` and `npm run build`**

Expected: tests PASS; build succeeds (may need env-less fallback paths).

---

### Task 4: Admin auth

**Files:**
- Create: `lib/admin-auth.ts`
- Create: `lib/admin-auth.test.ts` (optional: token round-trip with fixed secret)
- Create: `app/admin/login/page.tsx`
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`
- Create: `app/admin/layout.tsx` (redirect to login if no session, except login page)

**Interfaces:**
- Produces: `createSessionToken(): string`, `verifySessionToken(token: string): boolean`, `assertAdminRequest(req: Request): void` throws/redirects
- Cookie name: `pace_admin_session`, httpOnly, secure in production, `sameSite: lax`, signed with `ADMIN_SESSION_SECRET`
- Password compare: timing-safe against `ADMIN_PASSWORD`

- [ ] **Step 1: Implement auth helpers + login/logout routes**

- [ ] **Step 2: Wire admin layout guard**

Unauthenticated `/admin` → `/admin/login`. Authenticated login page → `/admin`.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, open `/admin` without cookie → login screen.

---

### Task 5: Admin APIs — highlights, links, publish

**Files:**
- Create: `app/api/admin/highlights/route.ts` (`GET`, `PUT`)
- Create: `app/api/admin/posts/route.ts` (`GET`)
- Create: `app/api/admin/posts/[slug]/links/route.ts` (`PUT`)
- Create: `app/api/admin/posts/[slug]/publish/route.ts` (`POST`, `DELETE`)
- Create: `lib/affiliate-url` validation on all writes
- Modify: `lib/schema.ts` if a shared admin payload schema helps

**Interfaces:**
- `PUT links` body: `{ links: { shoeName: string; affiliateUrl: string }[] }` — empty string clears
- `POST publish`: load MDX shoes + overrides; if `!allShoesHaveOverrides` → `409` with `{ error: "missing_affiliate_links" }`; else upsert publication
- `DELETE publish`: delete publication row
- `PUT highlights`: validate with `weeklyHighlightsSchema` + each shoe URL allowlisted
- All routes: `assertAdminRequest` first; no DB → `503`

- [ ] **Step 1: Implement routes**

- [ ] **Step 2: Add focused test or scripted assertion for publish 409 logic**

Reuse `allShoesHaveOverrides` (already tested); route can stay thin.

- [ ] **Step 3: Typecheck / build**

Run: `npm run build`  
Expected: PASS

---

### Task 6: Admin UI

**Files:**
- Create: `app/admin/page.tsx` (hub: links to destaques + posts)
- Create: `app/admin/destaques/page.tsx`
- Create: `app/admin/posts/page.tsx`
- Create: `app/admin/posts/[slug]/page.tsx`
- Optional small client components under `components/admin/` for forms

**Interfaces:**
- Consumes admin GET APIs / server-side store reads with session
- Posts list: group **Aguardando** vs **No ar** using `isPostPublic` + missing override counts
- Post detail: inputs per shoe, Save links, Publicar disabled until complete, Despublicar if publication row exists
- Destaques: 5 shoe fields + weekLabel + Save
- UI: functional, reuse existing CSS variables/tokens lightly — not a marketing page

- [ ] **Step 1: Build pages + forms (server actions or fetch to APIs)**

- [ ] **Step 2: Smoke in browser**

Login → save a `meli.la` link → Publicar → confirm post visible on `/blog` and CTA href updated without redeploy.

---

### Task 7: Grok docs + grandfather note

**Files:**
- Modify: `CONTENT.md`
- Modify: `.cursor/skills/seo-blog-ptbr/SKILL.md`
- Modify: existing post only if needed (keep `draft: false` so grandfather stays live)

**Interfaces:**
- Docs state: new posts `draft: true`; placeholders OK for `affiliateUrl`; real affiliate URLs + Publicar in `/admin`; do not require Grok to edit Neon

- [ ] **Step 1: Update CONTENT.md and skill**

- [ ] **Step 2: Final `npm test` + `npm run build`**

Expected: PASS

---

## Execution notes

- Create Neon project / set Vercel envs during Task 1–4 handoff (Marcelo may need to approve Neon create / paste `DATABASE_URL`).
- Apply `db/schema.sql` once on the Neon branch used by production.
- Seed highlights from `content/destaques-semana.json` on first empty read or via one-shot SQL.
