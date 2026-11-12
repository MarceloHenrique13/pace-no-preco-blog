# Design: overrides de imagem no admin de posts

**Date:** 2026-11-12  
**Status:** approved  
**Product:** Pace no Preço blog

## Intent

Marcelo precisa corrigir capa e fotos dos tênis de um post (ex.: placeholders do bot) sem editar MDX/git/deploy.

## Approach

- Upload via Vercel Blob (mesmo fluxo dos destaques).
- Overrides no Neon; MDX continua fallback.
- Merge em `getPostBySlug` / `getAllPosts` para páginas públicas e admin (admin vê MDX + override atual).

## Data

Tabela `post_image_overrides`:

| column | notes |
|--------|--------|
| `post_slug` | text |
| `target` | `__cover__` ou `shoes[].name` |
| `image_url` | text (path `/images/...` ou URL Blob) |
| `updated_at` | timestamptz |

Unique `(post_slug, target)`.

## Admin UI

Em `/admin/posts/[slug]`: bloco de capa +, em cada tênis, campo/URL + file upload; salvar persiste overrides (vazio limpa).

## Non-goals

- Editar corpo MDX / FAQ.
- Trocar imagens fora do admin (bot continua escrevendo paths no MDX).
