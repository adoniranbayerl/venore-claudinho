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
- Arquivos `*.test.ts` são unitários e não podem depender de banco real; `npm test` roda só esses (e é o que o CI executa).
- Arquivos `*.integration.test.ts` (ex: `client.integration.test.ts`) exigem Postgres via `DATABASE_URL` e rodam com `npm run test:integration`, fora do CI.

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
<!-- END:venore-docks-rules -->
