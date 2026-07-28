<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:venore-docks-rules -->
# Venore Docks — regras de arquitetura

Documento completo em `docs/venore-docks.md`. Leia antes de decisões estruturais.

## Camadas por use case
handler.ts (orquestra, valida, autoriza — chama 1 service) → service.ts (regra de negócio) → store.ts (acesso a dado, sem regra) → view.ts (DTO de saída) → types.ts (tipos e OperationResult)

`handler` e `service` sempre retornam:
```ts
type OperationResult<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };
```

## Boundary — nunca violar
- `use case` não importa `use case` de outro `context` diretamente.
- `plugin` só importa `contexts/<nome>/contracts` e `contexts/<nome>/index.ts` (barrel público). Nunca `store`, `schema`, `database/client`, nem `service` fora do barrel — nem para leitura.
- `service` pode chamar `service` público de outro `context` via barrel, para compor dado (ex: CMS + RBAC). Sem ciclo entre contexts.
- Toda regra de boundary acima precisa virar `eslint-plugin-boundaries` ou hook — não confiar só em instrução.

## Testes: unitário vs integração
- Arquivos `*.test.ts` são unitários e não podem depender de banco real; `npm test` roda só esses (e é o que o job `check` do CI executa).
- Arquivos `*.integration.test.ts` (ex: `client.integration.test.ts`, os do academy) exigem um Postgres descartável via `TEST_DATABASE_URL` e rodam com `npm run test:integration` — **nunca reaproveitam `DATABASE_URL`**; sem `TEST_DATABASE_URL` definida a suíte falha cedo com mensagem clara em vez de rodar contra o banco de desenvolvimento. Rodam também no CI, num job `integration` separado (service container Postgres), que não substitui o `check`.
- `vitest.integration.config.ts` aplica as duas árvores de migration (`drizzle/` e `src/plugins/academy/migrations/`) uma vez por suíte via `globalSetup` (`src/test-support/integration/global-setup.ts`), e troca `DATABASE_URL` para `TEST_DATABASE_URL` dentro do processo de teste via `setupFiles` (`setup-env.ts`) — `infrastructure/database/client.ts` continua exatamente igual, só o valor da env var muda, e só para esse processo.
- **Isolamento entre testes é por `TRUNCATE ... CASCADE`, não transação com rollback.** Vários `store.ts` (ex: `reorder-lessons`, `delete-lesson`) já abrem sua própria `db.transaction()`, pegando uma conexão nova do pool de app — envolver o teste inteiro numa transação externa não commitada não seria visível pra essas conexões internas sem introduzir injeção de dependência só para teste. TRUNCATE evita esse problema e não exige tocar `client.ts`.
- **Por causa do TRUNCATE, `test.fileParallelism: false`.** Todos os arquivos de teste apontam pro mesmo banco descartável; com arquivos rodando em paralelo (padrão do Vitest), o `beforeEach` de um arquivo trunca tabela que outro arquivo tem em uso no meio de um teste — sintoma observado: `insert or update ... violates foreign key constraint` e asserções de slug/status alternando entre passar e falhar sem mudança de código. `fileParallelism: false` serializa a suíte inteira e resolve, sem precisar de um banco por worker.
- Helpers de seed ficam em `src/test-support/integration/academy-seed.ts`, fora de `src/contexts/*` e `src/plugins/*` de propósito: `eslint-plugin-boundaries` só classifica elementos por esses dois padrões de pasta, e o seed precisa montar fixtures cross-domínio (ex: uma `cms.entries` publicada, com `author_id` apontando pra um `auth.users` real) — algo que um `plugin` não pode fazer via boundary normal. Como não existe API pública para criar usuário (só nasce via evento do `DrizzleAdapter`, exceção já documentada acima), o insert em `auth.users` é o único acesso cru necessário; todo o resto do seed passa pelas funções `service.ts` reais dos use cases.
- **`next-auth` é stubado em `vitest.integration.config.ts`** (alias por regex exato, só o especificador `next-auth`, não `next-auth/providers/*`). Motivo: `create-lesson`/`update-lesson`/`publish-course` chamam `getEntry` importado do barrel `@/contexts/cms` — e esse barrel reexporta *todos* os handlers do context num arquivo só, incluindo os que importam `authorizeActor` (`@/contexts/rbac` → `@/contexts/auth` → `auth.config.ts`, que chama `NextAuth({...})` no top-level do módulo). `next-auth` importa `next/server` internamente, um subpath que o `package.json#exports` do Next não declara — só resolve dentro do bundler do próprio Next.js, nunca num processo Node/Vitest puro. O stub (`src/test-support/integration/stubs/next-auth.ts`) só existe pra esse módulo terminar de avaliar; nenhum teste chama `handlers`/`signIn`/`signOut`/`auth` de verdade.

## Vocabulário de cor — migração pra shadcn (concluída)
`globals.css` declarava dois vocabulários de cor em paralelo: o shadcn (`--color-background`,
`--color-primary` etc.) e um próprio (`surface-*`, `text-*`, `border-subtle/default/strong`,
`accent-soft`, `info-*`). O shadcn é o único vocabulário do projeto agora — o próprio foi eliminado
em duas sessões (sessão 1: `src/themes/**` e `src/components/**`; sessão 2: `src/app/**`,
`src/plugins/**`, `src/platform/**`, apagar os tokens próprios de `globals.css` e estender o lint).
Zero ocorrência do vocabulário antigo em `src/`; `eslint.config.mjs` reprova se reintroduzido
(regra estendida pra `src/plugins/**` e `src/platform/**` além dos três diretórios já cobertos).

| token próprio | shadcn | observação |
|---|---|---|
| `surface-base` / `surface-canvas` | `background` | `surface-canvas` não tinha nenhum uso em `.tsx`. |
| `surface-panel` | `card` | |
| `surface-elevated` | `muted` | |
| `surface-subtle` | `muted` | |
| `surface-overlay` | `popover` (+ opacidade `/80` quando é scrim de overlay: `Dialog`, `MobileNavDrawer`) | Sem papel "overlay" no shadcn; `--popover` ≠ `--surface-overlay` numericamente — mudança de tom pequena, mas real, decidida com o usuário na sessão 1. Também usado sem `/80` em `src/themes/venore-slime/theme.css` (gradiente de fundo do app, `--header-chip-bg`), onde a sessão 1 tinha deixado a variável CSS antiga em uso direto — corrigido na sessão 2. |
| `text-primary` | `foreground` | |
| `text-secondary` | `muted-foreground` | |
| `text-muted` | `muted-foreground` | mapeamento direto (sem opacidade), aceitando a diferença de fórmula (`text-muted` original misturava com `surface-panel`, não com transparente). |
| `text-tertiary` | `muted-foreground` + opacidade fixa **`/56`** | Shadcn só tem 2 níveis de texto (`foreground`/`muted-foreground`); este projeto usa 3. `56` replica exatamente a fórmula antiga (`color-mix(text-secondary 56%, transparent)` = `text-muted-foreground/56`, pixel-idêntico). Usar sempre esse valor, nunca outro. |
| `text-accent` | `primary` | Mudança de tom (não é opacidade de algo, é troca de papel) — decisão explícita do pedido original. Cobre também o link solto de `text-info` em `lesson-video-embed.tsx` (não seguia o padrão de banner dos outros 2 usos de `info-*`; tratado como link comum). |
| `border-subtle` | `border` | |
| `border-default` | `ring` | Alias de `border-strong` — mesmo valor. |
| `border-strong` | `ring` | **Não `input`.** `--border-strong` é numericamente idêntico a `--ring` (`--input` é idêntico a `--border`, um valor mais claro). A sessão 1 tinha usado `border-input` em 4 lugares (`media-picker-field.tsx`, `SidebarLeftSlot.tsx`) — corrigido na sessão 2 pro valor pixel-idêntico. `border-input` continua correto nos primitivos de formulário (`button.tsx`, `input.tsx`, `select.tsx`) — ali é convenção shadcn de scaffold, não uma tradução de `border-strong`. |
| `accent-soft` | `accent` + opacidade fixa **`/14`** | `--accent-soft` era `color-mix(accent 14%, transparent)`. `bg-accent/14` é a mesma conta, pixel-idêntico. Nunca usar `bg-accent` sólido no lugar — é bem mais saturado. |
| `info-*` (`border-info-border`/`bg-info-soft`/`text-info`) | `border-border bg-secondary text-secondary-foreground` | Não existe papel "info" no shadcn. Decidido com o usuário: colapsar em `secondary`/`border` (muda de azulado pra verde-neutro — aceito). |
| `rounded-control` | `rounded-xl` | `--radius-xl` (`calc(var(--radius) * 3)` = 0.6rem) é o mais próximo dos 4 passos derivados de `--radius` ao antigo `0.5rem` fixo. |
| `header-*`, `app-bg-*`/`app-background` | (não migram — são identidade do Venore Slime) | Vivem em `src/themes/venore-slime/theme.css` sob `[data-theme="venore-slime"]`. `src/components/ui/avatar.tsx` usa `bg-muted text-foreground` (default do `AvatarFallback` do shadcn/ui). |

`--warning-*` (`text-warning`/`bg-warning-soft`/`border-warning-border`) **não faz parte desta
eliminação** — é um token semântico próprio legítimo (aviso/bloqueio, usado em `src/app/(platform)/academy/**`),
sem equivalente no vocabulário shadcn, e continua declarado em `globals.css`.

## Preferências de UI: nav-mode (cookie) vs color-mode (localStorage) — assimetria intencional
`nav-mode` (`src/platform/nav-mode`) continua em cookie porque o servidor precisa saber qual
sidebar montar (main-nav vs admin-nav) no primeiro render; `color-mode` vive em `localStorage`
via `next-themes` porque só a classe `dark` no client depende dele. Não unificar os dois mecanismos.
<!-- END:venore-docks-rules -->
