# Plano de arquivos — bloguio

O agente se chama `bloguio` e vive em `bloguio/` na raiz deste repositório, ao lado de `content/` e `app/`. Não fica dentro de `app/`, `components/`, `lib/` nem de um checkout separado.

Por que aqui:

- O Marcelo pediu o agente no repo do Pace no Preço, para revisar no mesmo PR do blog.
- Os rascunhos têm de ir para `content/posts/*.mdx`. Com o projeto em `bloguio/`, o código resolve a raiz do blog subindo até achar `CONTENT.md` e `content/posts/` (ou usa `BLOG_ROOT`, se estiver definido).
- O blog é um pacote npm único, sem workspace pnpm/yarn. O `npm install` do Agent SDK fica isolado em `bloguio/node_modules` (gitignored) e não mexe no `package-lock.json` do Next.
- `defineAgent` não aponta `local.cwd` para o blog e a allowlist de ferramentas nativas é `[]`. O modelo não ganha shell nem editor de arquivo. Quem grava no disco são as tools, e só nos caminhos abaixo.

Caminhos em que o bloguio pode gravar:

- `content/posts/<slug>.mdx`
- `content/destaques-semana.json` toda segunda, e também quando o Marcelo pedir. Link real de afiliado continua atrás de aprovação
- `public/images/posts/` e `public/images/shoes/`, só com arquivo de imagem real (bytes), nunca baixado do Mercado Livre

Fora disso, inclusive `app/`, `components/`, `layout` e `lib/`, a tool recusa.

## Árvore

```text
bloguio/
├── PLAN.md                          este plano
├── AGENTS.md                        guia para quem edita o agente (não é o prompt)
├── package.json                     nome do agente = bloguio
├── package-lock.json
├── tsconfig.json
├── .gitignore
├── .env.example                     nomes dos segredos do Slack, sem valores
├── bot/
│   ├── agent.ts                     modelo e allowlist vazia de tools nativas
│   ├── instructions.md              prompt sempre ligado
│   ├── lib/                         código compartilhado; o SDK não descobre esta pasta
│   │   ├── paths.ts                 raiz do blog e allowlist de caminho
│   │   ├── affiliates.ts            placeholder e recusa de link inventado
│   │   ├── images.ts                foto do modelo e bytes de imagem
│   │   └── content-gate.ts          valida e serializa o MDX
│   ├── tools/
│   │   ├── list_posts.ts            inventário (leitura)
│   │   ├── read_blog_file.ts        lê só contrato, posts, destaques e imagens
│   │   ├── write_post.ts            grava o rascunho, com os gates
│   │   ├── write_highlights.ts      destaques da semana; data em America/Sao_Paulo
│   │   └── save_image.ts            grava jpg/png local; não faz HTTP
│   ├── skills/seo-blog-ptbr/SKILL.md
│   ├── schedules/rascunho-corrida.md
│   ├── schedules/destaques-semana.md
│   ├── channels/slack.ts            opcional; idle sem token
│   └── hooks/memory.ts              diário da sessão, gerado pelo init
└── evals/
    ├── evals.config.ts
    └── smoke.eval.ts
```

Fora de `bloguio/`, este PR só atualiza o contrato que o agente tem de obedecer:

- `CONTENT.md` — formato real dos posts, placeholder e proibições
- `.cursor/skills/seo-blog-ptbr/SKILL.md` — a mesma skill para o Cursor, alinhada ao contrato

Nada em `app/`, `components/`, `lib/` ou em post já publicado.

## Cada arquivo

| Arquivo | Função |
| --- | --- |
| `bot/agent.ts` | `defineAgent`. Modelo `grok-4.7` com `reasoning_effort=high`. `tools: []` tira shell, edit e busca nativa. As tools de `bot/tools/` continuam, porque o SDK expõe elas por MCP. Sem `local.cwd` no blog, para não herdar regras e MCP do site. |
| `bot/instructions.md` | Missão, ordem de prioridade, pt-BR, mix editorial, fluxo, formato da resposta e anti-goals. O procedimento longo de SEO fica na skill, para não ocupar todo turno. |
| `bot/skills/seo-blog-ptbr/SKILL.md` | Skill que o agente carrega ao escrever. Espelha `.cursor/skills/seo-blog-ptbr/SKILL.md` e cita as tools. |
| `bot/lib/paths.ts` | Acha a raiz do blog e recusa path traversal. |
| `bot/lib/affiliates.ts` | Única URL que o rascunho ganha sozinho: `https://pendente.invalid/PENDENTE_LINK_AFILIADO`. Link `meli.la` ou Mercado Livre só entra se estiver na lista que o Marcelo passou e a chamada da tool for aprovada por uma pessoa. |
| `bot/lib/images.ts` | Foto de tênis tem de bater com o nome do modelo, ou ser caminho `pendente-<slug-do-nome>`. Recusa host do Mercado Livre e não baixa URL. |
| `bot/lib/content-gate.ts` | Frontmatter no formato de `lib/schema.ts`: slug kebab-case, `draft: true`, description 120–160, ranking com exatamente 5 `shoes`, FAQ 3–6, sem canibalizar slug, sem `cons`. |
| `bot/tools/list_posts.ts` | Passo 1 do fluxo: slugs, títulos, draft e arquivos de imagem já existentes. |
| `bot/tools/read_blog_file.ts` | Lê `CONTENT.md`, um post, os destaques ou uma imagem listada. Não lê `app/` nem `lib/`. |
| `bot/tools/write_post.ts` | Única forma de criar o MDX. Em sessão de eval não grava no disco. |
| `bot/tools/write_highlights.ts` | JSON dos destaques. Grava o rótulo segunda–domingo em America/Sao_Paulo. Link real só com aprovação. |
| `bot/tools/save_image.ts` | Recebe bytes já em mãos (jpg/png, lado mínimo 320px) e grava em `public/images/posts` ou `public/images/shoes`. Sem fetch. |
| `bot/schedules/rascunho-corrida.md` | Posts, 3× por semana. Cron em UTC: `0 12 * * 1,3,5` = segunda, quarta e sexta, 09:00 em `America/Sao_Paulo`. |
| `bot/schedules/destaques-semana.md` | Home, 1× por semana. Cron em UTC: `0 11 * * 1` = segunda, 08:00 em `America/Sao_Paulo`. Sempre 5 tênis. |
| `bot/channels/slack.ts` | Canal Slack com prefixo `BLOGUIO`. Sem `BLOGUIO_SLACK_BOT_TOKEN` e `BLOGUIO_SLACK_APP_TOKEN` o canal sobe idle. Este PR não roda `slack create`. |
| `bot/hooks/memory.ts` | Hook padrão do `init`. O diário não é fonte de preço, spec nem link. |
| `evals/smoke.eval.ts` | Um turno: inventário + `write_post`. Confere frontmatter válido, `draft: true`, slug kebab-case diferente do post que já existe, 5 tênis e só o placeholder. |
| `.env.example` | Nomes das variáveis. Valores ficam fora do git. |

Playground e HTTP não têm arquivo: o `agent-sdk serve` / `dev` já expõe o playground e `POST /v1/session`.

## O que o código segura e o que o modelo decide

O código recusa path fora da lista, `draft: false`, slug repetido, ranking sem 5 itens, link de afiliado inventado, URL do Mercado Livre em imagem e arquivo que não seja o modelo (ou o placeholder de foto). Também não grava em sessão de eval.

O modelo escolhe a keyword, a intenção, o ângulo e o texto. Sem fonte no pedido, não cita drop, peso, espuma nem preço. Esta versão não tem ferramenta de web: isso evita raspagem do Mercado Livre. Spec sem fonte não entra no post.

## Placeholder de afiliado

`lib/schema.ts` exige `affiliateUrl` como URL. O token solto `PENDENTE_LINK_AFILIADO` quebra o parse, o `lib/content.ts` ignora o arquivo e o post não aparece no `/admin`. A URL `https://pendente.invalid/PENDENTE_LINK_AFILIADO` passa no Zod, o host não está na allowlist de afiliado (`lib/affiliate-url.ts`) e o token continua visível para o Marcelo.

## Fora deste PR

Sem deploy, sem `agent-sdk login`, sem publicar post, sem mudar `draft` de post já no ar, sem commit feito pelo agente em produção. Os comandos que o Marcelo roda estão na descrição do PR e no relatório.
