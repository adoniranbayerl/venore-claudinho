# Plugin `helpdesk` (Chamados) — documento de arquitetura

> Status: **proposta** — nada implementado. Este documento decide a forma do plugin: entidades e
> schema, modelo de delegação por fila, as **cinco** superfícies de consumo (portal do solicitante,
> quiosque anônimo por QR/token, área da equipe/admin, app do técnico, painel de TV/kanban),
> notificações in-app, estrutura de arquivos e faseamento. Um prompt por fase no apêndice.
>
> Segue as regras do `AGENTS.md`: fluxo de camadas §1 (`handler → service → store → view/types`,
> `OperationResult<T>`), rotas de plugin §1.1 (tudo em `src/plugins/helpdesk/routes/`, `app/`
> nunca conhece o nome do plugin — exceto os dois shims fora de `(platform)` da §4), barrel §2,
> tokens de cor shadcn §3, mobile-first §4, DoD §6.
>
> **Reusa por cópia** (nunca por `import` de `@/plugins/*`) dois precedentes já no código:
> - **`company-metrics`** — filas com delegação por membro (`sector_members` → `queue_members`),
>   admin de abas únicas dirigidas por `?tab=`, `key` slug gerado e nunca reeditável, `text`
>   solto sem FK para `user_id`/`media_id` (plugin não importa `contexts/*/database/schema`).
> - **`broadcast`** — `shared/scoped-authorization/` (permission ampla + atribuição explícita ao
>   recurso), saída pública por token fora do `(platform)` (`src/app/broadcast/out/[token]`),
>   handler sem `authorizeActor` para acesso por token (`get-output-state`, `verify-output-pin`).

---

## 0. Princípio: o plugin existe sozinho

- **`helpdesk` funciona 100% sem nenhum outro plugin instalado.** Sem `dependencies` no manifesto.
- **Nenhum plugin altera o outro.** O que se reaproveita de `company-metrics`/`broadcast` entra
  por **cópia** para dentro de `src/plugins/helpdesk/` — o `eslint-plugin-boundaries` bloqueia
  `import` entre plugins.
- O plugin não toca `next.config.ts`, `globals.css`, `theme.css` nem tema. Toques de core
  aceitos, cada um com precedente já no repo:
  - `src/plugins/registry.ts` + `src/plugins/route-registry.ts` + `platform/plugin-engine/plugin-seed-registry.ts` — registro (todo plugin faz).
  - dois shims de reexport em `src/app/chamados/` (§4) — precedente `src/app/broadcast/out/`.
  - `package.json` ganha `db:{generate,migrate}:helpdesk` — precedente `company-metrics`.
  - **`contexts/media` ganha um `uploadTicketAttachmentMediaAsset`** (ator autenticado, categoria
    reservada `ticket-attachments`, limite de tamanho) — precedente exato:
    `uploadActivitySubmissionMediaAsset` que o `academy` adicionou (`src/contexts/media/index.ts`).

---

## 1. Objetivo e comportamento esperado

Um sistema de **chamados de manutenção e TI** para uso interno na rede local. Cada equipe — **TI**,
**Manutenção**, e outras que vierem — é uma **fila** própria, com seus técnicos, categorias,
política de SLA, notificações e painel de TV. `helpdesk` não sabe que o Broadcast existe; o painel
de TV é consumível por ele como item de playlist `webpage` (igual às telas do `company-metrics`).

### Cinco superfícies

| # | Público | Rota | Auth |
|---|---|---|---|
| 1 | **Solicitante logado** | `/chamados`, `/chamados/:ref` | sessão (sem permission — self-service) |
| 2 | **Solicitante anônimo** | `/chamados/quiosque/[token]` (QR) + `/chamados/acompanhar/[trackingToken]` | token, sem login |
| 3 | **Admin / gestor de fila** | `/admin/helpdesk` (abas por `?tab=`) | `helpdesk.manage` |
| 4 | **App do técnico** | `/chamados/tecnico` (mobile-first, PWA-friendly) | `helpdesk.work` |
| 5 | **Painel de TV / kanban** | `/chamados/painel/[token]` — **múltiplas telas, um token cada** | token, sem login |

### Caso 1 — chamado aberto por usuário logado

1. **Abrir.** No `/chamados`, o solicitante escolhe a fila (**Manutenção**), digita **título**
   ("Lâmpada queimada — sala do Marketing") e **descrição**, escolhe categoria opcional
   ("Elétrica"), local ("Bloco B, sala Marketing") e anexa **até 3 fotos** (`contexts/media`, ver
   §2.2). O chamado nasce com **número** `manutencao-87`, `status = open`.
2. **Notificação de entrada.** Todo `manager`/`agent` da fila Manutenção recebe uma notificação
   in-app `new_ticket` (§2.3).
3. **Atribuição.** No `/admin/helpdesk` (aba **Fila**), o admin abre o card e **atribui a um
   técnico** (`assign-ticket`). O técnico atribuído recebe `assigned_to_you`; o card no dashboard
   e no painel de TV passa a mostrar o responsável.
4. **App do técnico.** O técnico vê a tarefa em `/chamados/tecnico` (aba "Minhas"), recebe a
   notificação, abre o detalhe, muda o estado (`open → in_progress`), **comenta** (nota pública
   ou interna) e **anexa fotos**. Cada mudança aparece no dashboard do admin (polling, §2.7) e na
   timeline.
5. **Resolver.** O técnico marca `resolved`. O solicitante recebe `resolved` e o convite de
   avaliação.
6. **Fechar.** O admin confere e **fecha** (`resolved → closed`). Só `helpdesk.manage` fecha.
7. **Faltou coisa.** Em vez de fechar, o admin **responde** pedindo mais informação
   (`add-comment` público + `change-status → waiting`). O solicitante recebe `needs_info` e
   responde pelo `/chamados/:ref`; ao responder, a fila/o técnico recebem `comment_added` e o
   chamado volta para `in_progress`.

### Caso 2 — chamado anônimo por QR (totem de pedido)

1. Uma pessoa **sem conta** vê um problema (ex.: "totem de pedido travado", "vazamento no
   corredor") e lê o **QR Code** colado no setor → abre `/chamados/quiosque/[token]`.
2. Formulário **curto**: descrição, local (pré-preenchido pelo `default_location` do quiosque),
   contato opcional ("ramal 32 / João da recepção"), **até 3 fotos** opcionais. A fila pode já
   vir fixada pelo quiosque (um QR "Manutenção") ou a pessoa escolhe.
3. Objetivo é **só avisar a manutenção** — sem cadastro, sem senha. Ao enviar, mostra o número do
   chamado e um **link de acompanhamento** (`/chamados/acompanhar/[trackingToken]`) que ela pode
   guardar para ver o andamento e, no fim, avaliar. A equipe da fila recebe `new_ticket`.

### Entregas de notificação

- **In-app** (Fase 3): centro de notificações no `/admin/helpdesk` e no `/chamados/tecnico`
  (badge + lista), com *polling*; enquanto a aba está aberta, dispara também `Notification` do
  browser (com permissão do usuário). Destinatários: `manager`/`agent` da fila (novo chamado),
  técnico atribuído (atribuição, comentário, reabertura), solicitante logado (comentário
  público, mudança de status, resolução). Solicitante anônimo **não recebe push** — acompanha
  pelo link.
- **E-mail e push com a aba fechada** (Web Push + service worker em `public/helpdesk/`) ficam
  para a **Fase 8** (§8): não existe `contexts/notifications` e o v1 não depende disso para
  funcionar.

Fora de escopo no v1 (ver §8): e-mail/push real, calendário de horário comercial para o SLA,
rate limiting real do endpoint anônimo, importação em massa.

---

## 2. Entidades e schema

`pgSchema("helpdesk")`. Todas as tabelas nascem com `id` `text` UUID (`$defaultFn(crypto.randomUUID)`),
`createdAt`/`updatedAt` `timestamp withTimezone`. `user_id`/`media_id` são sempre `text` solto
**sem FK** (o plugin não importa `contexts/auth`/`contexts/media` schema — nome/e-mail resolvidos
via `@/contexts/auth` `listUsers`, mídia via `@/contexts/media` `getMediaAsset`). Enums via
`check(...)` como em `company-metrics`.

### 2.1 Fila e organização — Fase 1

**`queues`** — uma equipe/fila (TI, Manutenção, …). `key` slug do nome, gerado na criação,
**nunca digitado nem reeditável** (vira parte da URL de painéis e do prefixo do número do
chamado). `icon` = nome de ícone lucide de uma lista fixa. `archivedAt != null` esconde das
listagens sem apagar histórico. `default_priority` (`low|normal|high|urgent`, default `normal`)
é usado no chamado que nasce sem categoria — coluna adicionada na Fase 4.

| coluna | tipo | nota |
|---|---|---|
| `id` | text pk | |
| `key` | text, unique | slug gerado |
| `name` | text | |
| `description` | text null | |
| `icon` | text null | nome lucide |
| `position` | integer default 0 | ordem na UI |
| `archived_at` | timestamptz null | |

**`queue_members`** — delegação por fila (pk composta `(queueId, userId)`, uma linha por pessoa).
`role in ('manager','agent')`. `manager` configura a fila (SLA, categorias, membros `agent`) e
atende; `agent` só atende. Estar aqui **não substitui** a permission `helpdesk.work` — é
restrição *a mais* sobre ela (`shared/scoped-authorization`, §3). Só `helpdesk.manage` mexe em
`manager`.

**`categories`** — categoria opcional dentro de uma fila ("Rede", "Impressora", "Ar-condicionado",
"Elétrica"). `(queueId, key)` unique, `key` slug gerado. `archivedAt` para aposentar sem quebrar
chamados antigos. Pode carregar `default_priority` (null = usa o da fila).

### 2.2 Chamado, timeline e anexos — Fase 2

**`tickets`**

| coluna | tipo | nota |
|---|---|---|
| `id` | text pk | |
| `queue_id` | text → queues, `onDelete restrict` | não se apaga fila com chamado; arquiva |
| `category_id` | text → categories null, `onDelete set null` | |
| `seq` | integer | sequência **por fila**, gerada em transação (ver abaixo) |
| `title` | text | |
| `description` | text | |
| `status` | text check | `open` · `in_progress` · `waiting` · `resolved` · `closed` · `cancelled` |
| `priority` | text check | `low` · `normal` · `high` · `urgent` (Fase 4; Fase 2 fixa `normal`) |
| `assignee_user_id` | text null | técnico responsável |
| `requester_user_id` | text null | preenchido no portal logado |
| `requester_name` | text null | quiosque anônimo (Fase 5) |
| `requester_contact` | text null | quiosque: "ramal 32 / João" (Fase 5) |
| `origin_kiosk_id` | text → kiosks null, `onDelete set null` | Fase 5 |
| `tracking_token` | text null, unique | Fase 5 — link de acompanhamento anônimo |
| `location` | text null | onde está o problema (prédio/sala/equipamento) |
| `sla_due_at` | timestamptz null | Fase 4 — calculado na criação/mudança de prioridade |
| `first_response_at` | timestamptz null | 1º comentário público de agente ou 1ª atribuição |
| `resolved_at` | timestamptz null | |
| `closed_at` | timestamptz null | |
| `reopened_count` | integer default 0 | Fase 7 |
| `rating_score` | integer null check 1..5 | Fase 7 — denormalizado do evento `rating` |

Número exibido = `{queue.key}-{seq}` (ex: `ti-1042`, `manutencao-87`). `seq` vem de
**`ticket_counters`** (`queue_id` pk, `next_seq` integer) com `UPDATE ... RETURNING` dentro da
mesma `db.transaction()` do insert do chamado — serializa a criação por fila, aceitável no volume
de uma rede interna. `(queue_id, seq)` unique.

**`ticket_events`** — timeline única (histórico + comentários no mesmo lugar, ordenado por
`createdAt`).

| coluna | tipo | nota |
|---|---|---|
| `id` | text pk | |
| `ticket_id` | text → tickets, `onDelete cascade` | |
| `kind` | text check | `created` · `comment` · `status_change` · `assignment` · `priority_change` · `queue_transfer` · `category_change` · `reopened` · `rating` |
| `author_user_id` | text null | null = sistema ou solicitante anônimo |
| `author_label` | text null | "Sistema", ou nome do solicitante anônimo |
| `visibility` | text check | `public` (solicitante vê) · `internal` (só a equipe) |
| `body` | text null | corpo do `comment`/`rating` |
| `meta` | jsonb null | `{ from, to }` de status/assignee/priority/queue/category |
| `created_at` | timestamptz | |

Toda mudança de estado grava um `ticket_event` correspondente no mesmo `service` (mesma
transação quando possível) — a timeline é a fonte de verdade da auditoria do chamado.

**`ticket_attachments`** — `ticket_id` → tickets cascade; `event_id` → ticket_events null cascade
(anexo preso a um comentário específico ou ao chamado); `media_id` text (resolve via
`@/contexts/media` `getMediaAsset`); `uploaded_by_user_id` text null. **Máximo de 3 por chamado
na abertura** e por comentário — regra no `validation.ts` + reforçada no `service`.
Upload logado passa por um novo `uploadTicketAttachmentMediaAsset` em `@/contexts/media`
(ator autenticado, categoria reservada `ticket-attachments`, limite de tamanho — precedente:
`uploadActivitySubmissionMediaAsset` do `academy`). Anexo do quiosque anônimo: §2.5.

### 2.3 Notificações in-app — Fase 3

**`helpdesk_notifications`**

| coluna | tipo | nota |
|---|---|---|
| `id` | text pk | |
| `recipient_user_id` | text | destinatário (sempre um usuário; anônimo não recebe) |
| `ticket_id` | text → tickets, `onDelete cascade` | |
| `kind` | text check | `new_ticket` · `assigned_to_you` · `comment_added` · `needs_info` · `status_changed` · `resolved` · `reopened` · `sla_at_risk` (Fase 4) · `rating_received` (Fase 7) |
| `summary` | text | linha pronta pra lista ("Manutenção · manutencao-87 · novo chamado") |
| `read_at` | timestamptz null | |
| `created_at` | timestamptz | |

Índice `(recipient_user_id, read_at, created_at desc)`. Uma notificação é criada pelo mesmo
`service` que faz a ação (ex.: `assign-ticket` cria `assigned_to_you`), via um helper
`shared/notify.ts` que resolve os destinatários (`queue_members` da fila + `assignee` +
`requester_user_id`, deduplicado, nunca o próprio autor da ação). **Sem** e-mail/push no v1 —
só linha no banco.

Entrega ao cliente: `GET /api/helpdesk/notifications` (autenticado, últimas N + contador de não
lidas) por *polling* a cada ~30 s no `/admin/helpdesk` e no `/chamados/tecnico`;
`mark-notifications-read`. Com a aba aberta e permissão concedida, o cliente também dispara
`new Notification(...)` do browser para as não lidas novas.

### 2.4 SLA — Fase 4

**`sla_policies`** — pk composta `(queueId, priority)`. `first_response_minutes` integer,
`resolution_minutes` integer. v1: **horas corridas** (24/7); pausa em "aguardando" e horário
comercial ficam para a Fase 8. Adiciona `queues.default_priority` e a coluna `tickets.priority`.
Ao criar o chamado e a cada `priority_change`, o `service` recalcula
`sla_due_at = now + policy.resolution_minutes`. `first_response_at` grava no primeiro `comment`
público de um agente ou na primeira `assignment`. Um chamado que cruza 80 % do prazo sem
`first_response_at`/resolução gera `sla_at_risk` para a fila.

### 2.5 Quiosque anônimo — Fase 5

**`kiosks`** — ponto de abertura sem login.

| coluna | tipo | nota |
|---|---|---|
| `id` | text pk | |
| `token` | text unique | hex aleatório (`crypto.randomUUID().replace(/-/g,'')`), vai no QR |
| `label` | text | "Recepção Bloco A" |
| `queue_id` | text → queues null, `onDelete set null` | fila pré-fixada; null = solicitante escolhe |
| `default_location` | text null | pré-preenche `location` |
| `active` | boolean default true | |

Submissão: `POST /api/helpdesk/kiosk/[token]` (route handler no `route-table.ts`, despachado por
`src/app/api/[plugin]/[[...slug]]/route.ts`). Handler **sem** `authorizeActor` (acesso por token,
racional de `verify-output-pin`); valida token+ativo, aplica throttle ingênuo por token/IP (rate
limiting real = gap da plataforma, `AGENTS.md` §7), cria o chamado com `requester_user_id = null`,
`origin_kiosk_id`, `tracking_token` novo, `status = open`, e gera `new_ticket` para a fila.
Resposta: número do chamado + URL de acompanhamento.

**Fotos no quiosque (até 3):** o handler recebe os arquivos e os ingere por um caminho de
sistema/confiável de `contexts/media` ancorado no token do quiosque (mesma família dos exports
"de sistema" já presentes em `contexts/media/index.ts`). Se esse caminho não puder ser exposto
sem risco, o upload anônimo de foto **desce para a Fase 8** e o quiosque v1 fica texto — o resto
da Fase 5 não bloqueia.

> **Fase 5 implementada (2026-09-01) — quiosque texto-only.** `contexts/media` não expõe hoje um
> caminho de ingestão de bytes sem sessão; abrir um num endpoint 100% anônimo, sem rate limiting
> real da plataforma (§8 / AGENTS.md §7), é vetor de abuso de storage. O formulário do quiosque
> ficou descrição/local/contato/nome; **foto anônima desce para a Fase 8** (§8). O envio tem
> throttle ingênuo por token (`shared/kiosk-throttle.ts`, janela de 30 s, estado em `globalThis`).

Acompanhamento: `/chamados/acompanhar/[trackingToken]` — `get-ticket-by-tracking-token` (sem
`authorizeActor`), timeline só com eventos `public`, permite `comment` público e `rating`.

> Na Fase 5 o `rating` é **só evento** (`ticket_events.kind = "rating"`, nota em `meta.score`,
> `add-tracking-comment` + `rate-ticket` sem `authorizeActor`, throttle por token com chave
> própria). A denormalização em `tickets.rating_score`, o `rating-prompt` do portal logado e o
> relatório continuam na Fase 7.

### 2.6 Painel de TV — Fase 6

**`boards`** — um painel salvo com token próprio (**quantos quiser** — uma TV na sala da
Manutenção, outra na de TI, outra na recepção).

| coluna | tipo | nota |
|---|---|---|
| `id` | text pk | |
| `token` | text unique | vai na URL `/chamados/painel/[token]` |
| `label` | text | |
| `queue_id` | text → queues null, `onDelete cascade` | null = todas as filas |
| `layout` | text check | `kanban` (colunas por status) · `open_list` (só abertos, por prioridade) |
| `show_assignee` | boolean default true | |
| `refresh_seconds` | integer default 20 | |

v1: a página faz **polling** a cada `refresh_seconds` em `GET /api/helpdesk/board/[token]`
(`get-board-feed`, sem auth). SSE (precedente `broadcast`) = Fase 8.

---

## 3. Autorização

### 3.1 Permissions (manifesto)

| key | quem | o quê |
|---|---|---|
| `helpdesk.manage` | admin do plugin | cria/edita/arquiva filas, SLA, categorias, quiosques, painéis; delega `manager`/`agent`; vê, atribui, age e **fecha** qualquer chamado de qualquer fila |
| `helpdesk.work` | técnico | atende chamados **das filas em que é `queue_member`** (assumir, comentar, anexar, mudar status/prioridade/categoria, transferir); precisa da permission **E** da linha em `queue_members` |
| `helpdesk.read` | liderança | vê a fila e a timeline (inclui notas `internal`) de qualquer chamado, **sem** agir |

**Abrir / ver / comentar / anexar / reabrir / avaliar o próprio chamado não exige permission** —
self-service, `actorId` da sessão dentro do handler (padrão `contexts/auth`
`updateOwnAvatar`/`setOwnPassword`). O portal `/chamados` só exige estar logado.
**Fechar** (`resolved → closed`) é ação de `helpdesk.manage` — o técnico chega até `resolved`.

### 3.2 `shared/scoped-authorization/` (cópia do padrão `broadcast`)

```ts
// authorizeQueueActor(queueId): helpdesk.manage passa direto;
//   senão exige helpdesk.work E queue_members(queueId, actorId).
// authorizeTicketActor(ticketId): resolve o queueId do ticket e delega para authorizeQueueActor
//   (mesmo padrão de authorizeAgendaEventActor — a ação recebe só o ticketId).
```

`helpdesk.read` entra como caminho "somente leitura" nos `service` de consulta (`get-ticket`,
`list-tickets`), nunca nos de escrita.

### 3.3 Navegação admin

Uma entrada `navigation` no manifesto → `/admin/helpdesk`, `groupKey: "plugins"`,
`requiredPermission: ["helpdesk.manage", "helpdesk.work", "helpdesk.read"]`. Página admin nova
passa pelo loader compartilhado de gate (`platform/admin-shell/get-*-page-data.ts`), não
reimplementa a checagem (`AGENTS.md` §6.10).

---

## 4. Superfícies e rotas

Tudo em `src/plugins/helpdesk/routes/` + `route-table.ts` (`PluginRouteTable`). `admin`/`api` são
relativos (sem o nome do plugin); `public` é caminho completo.

```ts
export const helpdeskRouteTable: PluginRouteTable = {
  admin: [{ pattern: "", Component: asPluginPage(AdminPage) }],           // /admin/helpdesk (?tab=)
  public: [
    { pattern: "chamados", Component: asPluginPage(PortalPage) },                        // lista + abrir
    { pattern: "chamados/tecnico", Component: asPluginPage(TechnicianAppPage) },         // app do técnico
    { pattern: "chamados/acompanhar/:trackingToken", Component: asPluginPage(TrackPage) }, // anônimo
    { pattern: "chamados/:ticketRef", Component: asPluginPage(PortalTicketPage) },       // detalhe (ti-1042)
  ],
  api: [
    { pattern: "kiosk/:token", handlers: asPluginApiHandler(kioskSubmitHandlers) },     // POST anônimo
    { pattern: "board/:token", handlers: asPluginApiHandler(boardFeedHandlers) },       // GET polling
    { pattern: "notifications", handlers: asPluginApiHandler(notificationsHandlers) },  // GET + POST read (sessão)
  ],
};
```

`:ticketRef` casa `{queue.key}-{seq}` — o componente faz o split e resolve. Ordem importa:
`chamados/tecnico` e `chamados/acompanhar/:trackingToken` antes de `chamados/:ticketRef`.

**App do técnico** (`/chamados/tecnico`) fica **dentro** do `(platform)` (técnico é logado) mas é
uma tela enxuta e mobile-first: "Minhas" / "Fila" / notificações, detalhe do chamado com timeline
e ações (mudar status, comentar, anexar). Reusa a mesma camada `features/` do admin — é uma
casca de apresentação, não lógica nova. Um `public/helpdesk/manifest.webmanifest` deixa a tela
instalável como app; o service worker para push real é Fase 8.

### Abas do `/admin/helpdesk` (dirigidas por `?tab=`)

`Fila` (chamados abertos das minhas filas, filtros, drawer de detalhe com atribuição) ·
`Meus chamados` (atribuídos a mim) · `Notificações` (Fase 3) · `Filas & SLA` (`helpdesk.manage`) ·
`Categorias` · `Quiosques` (`manage`) · `Painéis` (`manage`) · `Relatório` (Fase 7).

### Shims fora de `(platform)` (exceção do `AGENTS.md` §1.1, igual `broadcast/out`)

Quiosque e painel de TV precisam **escapar da shell** (sem header/nav/footer):

```
src/app/chamados/quiosque/[token]/page.tsx  →  export { default } from "@/plugins/helpdesk/routes/kiosk/page";
src/app/chamados/painel/[token]/page.tsx     →  export { default } from "@/plugins/helpdesk/routes/board/page";
```

(`src/app/chamados/` é um **namespace de URL**, não o nome do plugin — `helpdesk` ≠ `chamados`,
igual `academy` é dono de `/cursos`.)

---

## 5. Ciclo de vida do chamado

```
            ┌───────────────── cancelled  (qualquer estado não-final; helpdesk.manage)
            │
open ──▶ in_progress ⇄ waiting
            │                   ▲
            │                   └── "faltou informação": admin/técnico comenta (público)
            │                       e move para waiting → solicitante recebe needs_info;
            │                       ao responder, volta para in_progress
            ▼
        resolved ──▶ closed        (helpdesk.manage; ou auto-close após N dias — Fase 7)
            │
            └──▶ in_progress       (reabertura pelo solicitante em até N dias; reopened_count++ — Fase 7)
```

- **`open`**: recém-criado, sem responsável. Sai ao ser atribuído ou ao primeiro `in_progress`.
- **`waiting`**: aguardando o solicitante/terceiro. v1 o relógio de SLA **continua** correndo
  (pausa = Fase 8).
- **`resolved`**: técnico marcou como resolvido → notifica o solicitante + convite de avaliação.
  **Quem fecha é o admin** (`helpdesk.manage`), depois de conferir.
- **`closed`** / **`cancelled`**: terminais. `closed → *` só com `helpdesk.manage`.

`shared/ticket-state.ts` exporta o mapa de transições + guardas (só `assignee`/`manager`
resolve; só `helpdesk.manage` fecha; só `requester` reabre) e é coberto por teste unitário. Cada
transição grava o `ticket_event` (`status_change`, `meta:{from,to}`) e dispara `shared/notify.ts`
no mesmo `service`. O dashboard do admin e o app do técnico refletem por *polling* (§2.3/§2.6);
SSE é Fase 8.

**Realce de SLA (Fase 4)**: o `view` marca `breached = sla_due_at < now && resolved_at == null` e
`atRisk` (< 20 % do prazo restante) — só leitura/cor, `text-destructive` / `text-warning`, sem cor
crua.

---

## 6. Estrutura de arquivos

```
src/plugins/helpdesk/
  manifest.ts
  index.ts                      # barrel público (só handlers + tipos de contracts)
  drizzle.config.ts             # migrationsSchema: "helpdesk_migrations"
  database/schema/index.ts      # todas as tabelas, comentadas por fase
  migrations/                   # 0001_… por fase, geradas por db:generate:helpdesk
  contracts/types.ts            # records + enums const (QUEUE_MEMBER_ROLES, TICKET_STATUSES, …)
  shared/
    slugify.ts
    ticket-reference.ts         # {queueKey}-{seq}  <->  parse
    ticket-state.ts (+ .test)   # transições permitidas + guardas
    notify.ts (+ .test)         # resolve destinatários + grava helpdesk_notifications
    sla.ts (+ .test)            # dueAt, breach, atRisk
    tracking-token.ts / kiosk-token.ts
    scoped-authorization/
      index.ts (+ .test)        # authorizeQueueActor / authorizeTicketActor
      store.ts                  # isUserMemberOfQueue, findQueueIdByTicketId, queueIdsForUser
  features/
    queues/         create-queue · update-queue · archive-queue · list-queues
                    set-queue-members · list-queue-members
    categories/     create-category · update-category · archive-category · list-categories
    sla/            set-sla-policy · list-sla-policies
    tickets/        open-ticket · submit-kiosk-ticket · list-tickets · list-my-tickets
                    list-assigned-to-me · get-ticket · get-ticket-by-tracking-token
                    add-comment · change-status · assign-ticket · change-priority
                    transfer-queue · change-category · reopen-ticket · rate-ticket
    attachments/    add-ticket-attachment · list-ticket-attachments
    notifications/  list-my-notifications · mark-notifications-read · get-unread-count
    boards/         create-board · update-board · delete-board · list-boards
                    get-board (token) · get-board-feed (token)
    access/         get-my-helpdesk-access   # filas que gerencio/atendo + contadores
    reporting/      get-queue-report         # Fase 7
  components/
    admin/   queue-form · sla-editor · category-list · ticket-table · ticket-drawer
             kiosk-list · board-form · queue-report-panel · notification-panel
    portal/  new-ticket-form · my-tickets-list · ticket-timeline · rating-prompt
    tech/    task-list · task-detail · notification-bell     # app do técnico (mobile-first)
    kiosk/   kiosk-form
    board/   kanban · kanban-column · ticket-card
  routes/
    route-table.ts
    admin/page.tsx · portal/page.tsx · portal-ticket/page.tsx · technician-app/page.tsx
    track/page.tsx · kiosk/page.tsx · board/page.tsx
    api/kiosk-submit/route.ts · api/board-feed/route.ts · api/notifications/route.ts
  seeds/index.ts                # filas TI+Manutenção, categorias, SLA padrão, 1 quiosque, 1 painel

# fora do plugin:
src/app/chamados/quiosque/[token]/page.tsx            # reexport
src/app/chamados/painel/[token]/page.tsx              # reexport
public/helpdesk/manifest.webmanifest                  # app do técnico instalável (public/<plugin>/ é permitido)
src/plugins/registry.ts                               # + helpdeskManifest
src/plugins/route-registry.ts                         # + helpdeskRouteTable
src/platform/plugin-engine/plugin-seed-registry.ts    # + helpdeskSeeds
src/contexts/media/index.ts                           # + uploadTicketAttachmentMediaAsset (precedente: academy)
package.json                                          # + db:{generate,migrate}:helpdesk (precedente: company-metrics)
```

---

## 7. Faseamento

Cada fase: seu commit, migration própria, `lint` + `typecheck` + `npm run test` verdes, teste
unitário do `service` (e do `handler` quando mexe em autorização/validação de borda). Fases que
cruzam mais de um domínio de dado (2, 3, 5, 6) ganham teste de integração.

| Fase | Entrega | Schema |
|---|---|---|
| **1 — Fundação** | `queues` + `queue_members` + `categories`; RBAC (3 permissions); `shared/scoped-authorization`; abas `Filas & SLA` (só filas) e `Categorias`; barrel + manifesto + registro; `get-my-helpdesk-access`. Seed exemplo (TI, Manutenção, categorias). | `0001` |
| **2 — Chamado + anexos** | `tickets` + `ticket_events` + `ticket_counters` + `ticket_attachments`; `uploadTicketAttachmentMediaAsset` em `contexts/media` (cat. `ticket-attachments`, **máx. 3**); `open-ticket`, `list-my-tickets`, `list-tickets`, `get-ticket`, `add-comment` (public/internal), `change-status`, `assign-ticket`, `add/list-ticket-attachment`; `ticket-reference.ts` + `ticket-state.ts` (+ testes). Portal `/chamados` + `new-ticket-form` (título/descrição/categoria/local/3 fotos) + `/chamados/:ref` + timeline; drawer de triagem+atribuição no admin. `priority` fixo `normal`. Integração: abrir→foto→comentar→atribuir→resolver→fechar. | `0002` |
| **3 — Notificações + app do técnico** | `helpdesk_notifications`; `shared/notify.ts` (+ testes de destinatário); `list-my-notifications`/`mark-notifications-read`/`get-unread-count`; `GET/POST /api/helpdesk/notifications`; `notify` disparado por `open-ticket`/`assign-ticket`/`add-comment`/`change-status`/`reopen`. Aba `Notificações` no admin + `notification-bell`. Rota `/chamados/tecnico` (mobile-first, "Minhas"/"Fila"/notificações, ações no detalhe) + `public/helpdesk/manifest.webmanifest`. `Notification` do browser com a aba aberta. | `0003` |
| **4 — Prioridade + SLA** | `tickets.priority` + `queues.default_priority` + `sla_policies`; `shared/sla.ts` (dueAt/breach/atRisk); `change-priority` + recálculo de `sla_due_at`; `first_response_at`; `sla_at_risk` → notificação; `sla-editor`; realce de estourado/risco nas listas, no drawer, no app do técnico e no painel. | `0004` |
| **5 — Quiosque anônimo (QR)** | `kiosks` + colunas de solicitante anônimo + `tracking_token`; `/chamados/quiosque/[token]` (shim fora da shell) + `POST /api/helpdesk/kiosk/[token]` (sem auth, throttle por token, form curto — **texto-only, foto → Fase 8**, ver §2.5); `/chamados/acompanhar/[trackingToken]` (timeline pública + comentar + avaliar; `rating` só evento nesta fase); aba `Quiosques` com QR pronto pra impressão. Integração do fluxo anônimo. **Feito 2026-09-01** — migration file `0004` (drizzle 0-indexa; doc "0005" = arquivo `0004`). | `0005` |
| **6 — Painel de TV / kanban** | `boards`; `/chamados/painel/[token]` (shim fora da shell) + `GET /api/helpdesk/board/[token]`; `kanban`/`open_list`; polling por `refresh_seconds`; aba `Painéis` (várias telas, um token cada). Mobile-first e legível a 3 m. | `0006` |
| **7 — Avaliação + reabertura + relatório** | evento `rating` + `tickets.rating_score` + `reopened_count`; `rate-ticket` (portal e tracking token) + `rating-prompt` em `resolved`; `reopen-ticket` (só `requester`, dentro de N dias); auto-close após N dias sem reabertura; aba `Relatório` (abertos por fila, % SLA cumprido, tempo médio de resolução, nota média). | `0007` |
| **8 — Refino (opcional)** | e-mail + Web Push com a aba fechada (service worker em `public/helpdesk/`, VAPID); SSE no painel e no dashboard no lugar de polling; pausa de SLA em `waiting` + horário comercial por fila; `recordAuditEvent` em transfer/force-reopen/cancel; upload de foto anônima no quiosque se ficou de fora da Fase 5. | conforme item |

---

## 8. Known gaps / decisões adiadas

- **E-mail e push com a aba fechada** — Fase 8. O v1 notifica in-app (linha no banco + *polling*
  + `Notification` do browser enquanto a aba está aberta). Não existe `contexts/notifications`;
  push real precisa de service worker (`public/helpdesk/`) + VAPID, ou de um `contexts/notifications`
  próprio.
- **Foto no quiosque anônimo** — **confirmado para a Fase 8** (a Fase 5 saiu texto-only, 2026-09-01):
  depende de `contexts/media` expor um caminho de ingestão sem sessão, ancorado no token do
  quiosque, e/ou de rate limiting real da plataforma. Enquanto isso, o quiosque aceita só texto.
- **Rate limiting do endpoint anônimo** (`/api/helpdesk/kiosk/[token]`) — só throttle ingênuo por
  token/IP no v1; rate limiting real é gap da plataforma (`AGENTS.md` §7).
- **SLA em horas corridas** (24/7), sem pausa em `waiting` nem horário comercial — Fase 8.
- **Propagação em tempo real** — dashboard e app do técnico usam *polling*; SSE (precedente
  `broadcast`) fica pra Fase 8.
- **Número do chamado** via `ticket_counters` com `UPDATE ... RETURNING` transacional: serializa
  a criação por fila. OK no volume de uma rede interna; se virar gargalo, trocar por sequence
  Postgres por fila.
- **Auditoria** (`observability/audit-log`) — `recordAuditEvent` ligado ação a ação; v1 registra
  só operação (`beginOperation`/`endOperation`). Expandir para as ações sensíveis é Fase 8.
- **Toques de core** — `contexts/media` (novo upload, precedente `academy`) e `package.json`
  (scripts `db:*`, precedente `company-metrics`). Se o dono quiser a regra estrita, rodar o
  `drizzle-kit` do plugin à mão e resolver o upload logado por `requestMediaUploadTicket` do
  fluxo de client-upload já existente.

---

## 9. Apêndice — prompt por fase

> Cada prompt assume o `AGENTS.md` e este documento como contexto. Rodar em sessões separadas.

**Fase 1 — Fundação**
> Implemente a Fase 1 do plugin `helpdesk` conforme `docs/chamados-plugin.md` §2.1, §3, §6. Crie
> `src/plugins/helpdesk/` com manifesto (permissions `helpdesk.manage`/`helpdesk.work`/`helpdesk.read`;
> navegação para `/admin/helpdesk`), schema `0001` (`queues`, `queue_members`, `categories`),
> barrel, `contracts/types.ts`, `shared/slugify.ts`, `shared/scoped-authorization/`
> (`authorizeQueueActor`/`authorizeTicketActor`, copiando o padrão de
> `src/plugins/broadcast/shared/scoped-authorization/`). Features CRUD de `queues`/`categories` +
> `set-queue-members`/`list-queue-members` + `get-my-helpdesk-access`, no fluxo
> `handler → service → store → view/types` com `OperationResult<T>`. Página `/admin/helpdesk` com
> abas `Filas & SLA` (só filas) e `Categorias` via `?tab=`, pelo loader de gate do `admin-shell`.
> Registre em `registry.ts`, `route-registry.ts`, `plugin-seed-registry.ts`. Seed `example` (TI,
> Manutenção + categorias). Testes de `service` e dos `handler` com autorização. Verdes.

**Fase 2 — Chamado + anexos**
> Implemente a Fase 2 conforme §2.2, §5. Schema `0002` (`tickets`, `ticket_events`,
> `ticket_counters`, `ticket_attachments`). Adicione `uploadTicketAttachmentMediaAsset` a
> `src/contexts/media` (ator autenticado, categoria reservada `ticket-attachments`, limite de
> tamanho), espelhando `uploadActivitySubmissionMediaAsset`. `shared/ticket-reference.ts` e
> `shared/ticket-state.ts` (+ testes de transições/guardas: só `assignee`/`manager` resolve, só
> `helpdesk.manage` fecha). Features `open-ticket`, `list-my-tickets`, `list-tickets`,
> `get-ticket`, `add-comment` (public/internal), `change-status`, `assign-ticket`,
> `add-ticket-attachment`/`list-ticket-attachments` (**máx. 3** por chamado/comentário, no
> `validation.ts` e no `service`). Portal `/chamados` (lista + `new-ticket-form` com
> título/descrição/categoria/local/até 3 fotos), `/chamados/:ticketRef` (detalhe + `ticket-timeline`),
> drawer de triagem+atribuição na aba `Fila`. `priority` fixo `normal`. Integração cobrindo
> abrir→anexar foto→comentar→atribuir→resolver→fechar. Verdes.

**Fase 3 — Notificações + app do técnico**
> Implemente a Fase 3 conforme §2.3, §4, §5. Schema `0003` (`helpdesk_notifications`, índice
> `(recipient_user_id, read_at, created_at desc)`). `shared/notify.ts` (+ testes: destinatários =
> `queue_members` da fila + `assignee` + `requester_user_id`, dedup, nunca o autor da ação).
> Chame `notify` de `open-ticket`/`assign-ticket`/`add-comment`/`change-status`/`reopen-ticket`.
> Features `list-my-notifications`/`mark-notifications-read`/`get-unread-count` +
> `GET/POST /api/helpdesk/notifications` (sessão). Aba `Notificações` no admin + `notification-bell`
> com polling ~30 s e `Notification` do browser (com permissão). Rota pública `chamados/tecnico`
> → `routes/technician-app/page.tsx` (mobile-first: "Minhas"/"Fila"/notificações, detalhe com
> mudar status/comentar/anexar, reusando `features/`). `public/helpdesk/manifest.webmanifest`.
> Integração do fluxo de notificação. Verdes.

**Fase 4 — Prioridade + SLA**
> Implemente a Fase 4 conforme §2.4, §5. Migration `0004` (`tickets.priority`,
> `queues.default_priority`, `sla_policies`). `shared/sla.ts` (+ testes: dueAt, breach, atRisk).
> `change-priority` + recálculo de `sla_due_at`; gravar `first_response_at`; `sla_at_risk` →
> `notify` da fila. `sla-editor` na aba `Filas & SLA`. Realce de estourado (`text-destructive`) e
> em risco (`text-warning`) nas listas, no drawer, no app do técnico e no painel — sem cor crua.
> Verdes.

**Fase 5 — Quiosque anônimo (QR)**
> Implemente a Fase 5 conforme §2.5, §4. Migration `0005` (`kiosks` + `requester_name`/
> `requester_contact`/`origin_kiosk_id`/`tracking_token` em `tickets`). `route-table.ts`: pública
> `chamados/acompanhar/:trackingToken` e API `kiosk/:token`. `routes/kiosk/page.tsx` + shim
> `src/app/chamados/quiosque/[token]/page.tsx` (fora de `(platform)`) — form curto
> (descrição/local/contato/até 3 fotos), fila fixada pelo quiosque ou escolhida.
> `submit-kiosk-ticket` e `get-ticket-by-tracking-token` **sem** `authorizeActor` (padrão
> `verify-output-pin`), throttle por token, `new_ticket` para a fila. Fotos por caminho de mídia
> confiável ancorado no token — se não for viável com segurança, quiosque texto-only e registra o
> gap. `/chamados/acompanhar/[trackingToken]`: timeline pública + comentar + avaliar. Aba
> `Quiosques` com QR pronto pra impressão. Integração do fluxo anônimo. Verdes.

**Fase 6 — Painel de TV**
> Implemente a Fase 6 conforme §2.6, §4. Migration `0006` (`boards`). Rota/API `board/:token` +
> `routes/board/page.tsx` + shim `src/app/chamados/painel/[token]/page.tsx`. `kanban`/`open_list`,
> polling a cada `refresh_seconds` em `GET /api/helpdesk/board/[token]` (`get-board-feed`, sem
> auth). Aba `Painéis` (várias telas, um token cada, `queue_id` null = todas). Mobile-first e
> legível a 3 m. Verdes.

**Fase 7 — Avaliação + reabertura + relatório**
> Implemente a Fase 7 conforme §2.2 (`rating_score`, `reopened_count`), §5. Migration `0007`.
> `rate-ticket` (portal e tracking token) gravando evento `rating` + denormalizando o score +
> `rating_received` para o `assignee`; `rating-prompt` quando `resolved`; `reopen-ticket` (só
> `requester`, dentro de N dias, `reopened_count++`, `notify`); auto-close após N dias sem
> reabertura. Aba `Relatório`: abertos por fila, % de SLA cumprido, tempo médio de resolução,
> nota média. Verdes.

---

## 10. Tabela de implementação

### 10.1 O que o plugin consome do Venore (não reimplementar)

| Domínio Venore | Barrel / entrada | Uso no `helpdesk` | Regra |
|---|---|---|---|
| **RBAC** | `@/contexts/rbac` → `authorizeActor(perm)`, `AuthorizeActorResult` | topo de **todo** `handler` de escrita; `helpdesk.manage`/`.work`/`.read` declaradas no `manifest.ts`; papéis atribuídos em `/admin/rbac` | nunca importar `contexts/rbac/**/store|schema`; escopo por fila é `queue_members` **por cima** da permission, não no lugar dela |
| **Auth** | `@/contexts/auth` → `listUsers` (`UserRef`), `getCurrentUser` | pickers de membro da fila e de responsável (nome/e-mail); resolver rótulo de autor na timeline | `user_id` guardado como `text` solto, **sem FK** (igual `company-metrics`) |
| **Media** | `@/contexts/media` → `getMediaAsset` (render) · **novo** `uploadTicketAttachmentMediaAsset` (upload logado) | anexos de chamado/comentário (máx. 3) | `media_id` `text` solto, sem FK; o novo upload espelha `uploadActivitySubmissionMediaAsset` do `academy` — categoria reservada, ator autenticado, limite de tamanho |
| **Temas / design** | — (nada importado) | só classes shadcn: `bg-card`, `text-muted-foreground`, `text-destructive`, `text-warning`, `border-border` | zero cor crua; `src/components/ui/**` não editado (`AGENTS.md` §3) |
| **Observability** | `@/observability` → `beginOperation`/`endOperation` (v1); `recordAuditEvent` (Fase 8) | um `beginOperation`/`endOperation` por `service` | log em lote, nunca `INSERT` por chamada (`AGENTS.md` §2) |
| **Banco** | `@/infrastructure/database/client` → `db` | único client; `pgSchema("helpdesk")`; migrations do plugin rodam no **install** (`run-plugin-migrations.ts`) | `store.ts` nunca abre pool próprio |
| **Plugin platform** | `@/platform/plugin-routing/types` (`asPluginPage`, `asPluginApiHandler`, `PluginRouteTable`); `@/platform/plugin-engine/manifest-schema` (`PluginManifest`); `@/platform/admin-shell` (loader de gate) | `route-table.ts`, `manifest.ts`, página `/admin/helpdesk` | `app/` não conhece o nome do plugin (exceto os 2 shims fora de `(platform)`) |
| **UI primitives** | `@/components/ui/*` (shadcn stock) | formulários, tabela, drawer, dialog, tabs, badge | customização visual fora do primitivo |

### 10.2 Plano por fase — arquivos, migration, testes, dependência

| Fase | Arquivos-chave a criar/editar | Consome (além do comum: `rbac`, `db`, `observability`) | Migration | Testes | Depende de |
|---|---|---|---|---|---|
| **1 — Fundação** | `manifest.ts` · `index.ts` · `drizzle.config.ts` · `database/schema/index.ts` (`queues`, `queue_members`, `categories`) · `contracts/types.ts` · `shared/slugify.ts` · `shared/scoped-authorization/{index,store}.ts` · `features/queues/*` (create/update/archive/list + set/list-members) · `features/categories/*` · `features/access/get-my-helpdesk-access/*` · `routes/route-table.ts` · `routes/admin/page.tsx` (abas Filas, Categorias) · `seeds/index.ts` · **core:** `src/plugins/registry.ts`, `src/plugins/route-registry.ts`, `platform/plugin-engine/plugin-seed-registry.ts`, `package.json` (`db:*:helpdesk`) | `@/contexts/auth` (`listUsers`) · `@/platform/admin-shell` · `@/platform/plugin-*` | `0001` | `service`: CRUD queue/category, set-members · `handler`: authz em create-queue/set-members · unit: `scoped-authorization`, `slugify` | — |
| **2 — Chamado + anexos** | schema (`tickets`, `ticket_events`, `ticket_counters`, `ticket_attachments`) · `shared/ticket-reference.ts` · `shared/ticket-state.ts` · `features/tickets/{open-ticket,list-tickets,list-my-tickets,get-ticket,add-comment,change-status,assign-ticket}` · `features/attachments/{add,list}-ticket-attachment` · `components/portal/{new-ticket-form,my-tickets-list,ticket-timeline}` · `components/admin/{ticket-table,ticket-drawer}` · `routes/{portal,portal-ticket}/page.tsx` · abas Fila / Meus chamados · **core:** `src/contexts/media/index.ts` + `features/assets/upload-ticket-attachment-media-asset/*` | `@/contexts/media` (`getMediaAsset` + novo upload) · `@/contexts/auth` (`listUsers`) | `0002` | unit: `ticket-state` (transições/guardas), `ticket-reference` · `service`: open/comment/status/assign · `handler`: authz assign/status · **integração**: abrir→foto→comentar→atribuir→resolver→fechar | 1 |
| **3 — Notificações + app do técnico** | schema (`helpdesk_notifications`) · `shared/notify.ts` · `features/notifications/{list-my-notifications,mark-notifications-read,get-unread-count}` · `routes/api/notifications/route.ts` · injeta `notify` em open/assign/comment/status/reopen · `components/admin/notification-panel` · `components/tech/{task-list,task-detail,notification-bell}` · `routes/technician-app/page.tsx` · `route-table` (`chamados/tecnico`, `api notifications`) · aba Notificações · **core:** `public/helpdesk/manifest.webmanifest` | `@/contexts/auth` (`listUsers`) | `0003` | unit: `notify` (dedup, exclui autor, destinatários) · `service`: list/mark-read · **integração**: assign → linha de notificação | 2 |
| **4 — Prioridade + SLA** | schema (`tickets.priority`, `queues.default_priority`, `sla_policies`) · `shared/sla.ts` · `features/sla/{set,list}-sla-policy` · `features/tickets/change-priority` · recálculo em open-ticket/change-priority · `first_response_at` em assign/add-comment · `sla_at_risk` em `notify` · `components/admin/sla-editor` · realce breach/atRisk em ticket-table/drawer/tech/board | — | `0004` | unit: `sla` (dueAt/breach/atRisk) · `service`: set-policy, recálculo em change-priority · `handler`: authz | 2 (3 p/ `sla_at_risk`) |
| **5 — Quiosque anônimo (QR)** | schema (`kiosks` + colunas anon + `tracking_token`) · `shared/{tracking-token,kiosk-token}.ts` · `features/tickets/{submit-kiosk-ticket,get-ticket-by-tracking-token}` · `features/kiosks/*` CRUD · `routes/{kiosk,track}/page.tsx` · `routes/api/kiosk-submit/route.ts` · `route-table` (`chamados/acompanhar/:trackingToken`, `api kiosk/:token`) · `components/kiosk/kiosk-form` · aba Quiosques (QR imprimível) · **core:** `src/app/chamados/quiosque/[token]/page.tsx` shim | `@/contexts/media` (ingestão confiável por token — ou texto-only) · lib de QR (checar deps; senão `<svg>` próprio) | `0005` | unit: throttle por token · `service`: submit cria ticket+token+`notify` · **integração**: submit → track → comentar | 2, 3 |
| **6 — Painel de TV / kanban** | schema (`boards`) · `features/boards/{create,update,delete,list,get-board,get-board-feed}` · `routes/board/page.tsx` · `routes/api/board-feed/route.ts` · `route-table` (`board/:token`) · `components/board/{kanban,kanban-column,ticket-card}` · aba Painéis · **core:** `src/app/chamados/painel/[token]/page.tsx` shim | `@/contexts/auth` (nomes de responsável) | `0006` | `service`: board CRUD, shape do feed · token: `get-board-feed` sem auth | 2 (4 opc. p/ coluna prioridade) |
| **7 — Avaliação + reabertura + relatório** | schema (`tickets.rating_score`, `reopened_count`) · `features/tickets/{rate-ticket,reopen-ticket}` · auto-close (job simples ou no list/get) · `features/reporting/get-queue-report` · `components/portal/rating-prompt` · `components/admin/queue-report-panel` · aba Relatório | — | `0007` | `service`: rate, reopen (guarda: só requester + janela), agregação do relatório · **integração**: resolver→avaliar→reabrir | 2, 3 |
| **8 — Refino (opcional)** | e-mail + Web Push (service worker `public/helpdesk/`, VAPID) · SSE no board/dashboard · pausa de SLA em `waiting` + horário comercial · `recordAuditEvent` em transfer/force-reopen/cancel · foto anônima no quiosque se ficou de fora | `@/observability` (`recordAuditEvent`) | conforme item | por item | 3–7 |

### 10.3 Arquivos tocados por **quase toda** fase (fonte de conflito se paralelizar)

`database/schema/index.ts` · `migrations/` + `_journal.json` · `index.ts` (barrel) · `contracts/types.ts` ·
`routes/route-table.ts` · `routes/admin/page.tsx` (abas) · `src/plugins/registry.ts` · `shared/notify.ts` (fases 3–7).

### 10.4 Ordem de execução recomendada

Sequencial, **uma sessão por fase**, na ordem 1 → 7 (8 é opcional e incremental), cada fase num
commit próprio na branch `helpdesk-plugin` (a partir de `main`). É o mesmo modelo já usado em
`docs/broadcast-plano-correcoes.md` e `docs/metricas-internas-plugin.md`. Não paralelizar: as
migrations são numericamente ordenadas, os arquivos da §10.3 são reescritos em toda fase, e as
fases 3/4/5/7 dependem da camada `features/` da fase 2 e do `shared/notify.ts` da fase 3. Se for
inevitável paralelizar, os únicos pares de baixo atrito são **5 (quiosque)** e **6 (painel)**
depois da fase 3 — ainda assim com merge manual de `schema/index.ts`, `route-table.ts` e
`registry.ts`.
