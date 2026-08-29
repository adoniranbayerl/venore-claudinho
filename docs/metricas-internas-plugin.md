https://claude.ai/code/artifact/4e690c27-bcdc-431f-bac6-bc53fad48555

# Plugin `company-metrics` (Métricas Internas) — documento de arquitetura

> Status: **Fases 1–7 implementadas (2026-08-28)**, branch `company-metrics-plugin` (sem push).
> Verde: `lint` + `typecheck` + `npm run test` (1401 testes). Testes de **integração** (`npm run
> test:integration`, precisa de `TEST_DATABASE_URL`) NÃO rodados nesta sessão — os alvos
> `run-plugin-migrations` / `uninstall-plugin` foram retargetados de `enrollment-dashboard` para
> `company-metrics` e devem passar no CI. Revisão visual das superfícies (admin, `/metricas`, TV)
> pendente — nada foi aberto num browser.
>
> Commits: `9f63bd1` F1 · `50911c6` F2 · `2c07c7f` F3 · `2776657` F4 · `a563f9a` F5 ·
> `382cb8d` F6 · `36b250c` F7.
>
> **Rodada de melhorias (`c2e4dec`), após o dono instalar e testar:**
> - seed `fluxo-completo`: funil do aluno (Marketing → Comercial → Financeiro → Secretaria) com
>   ~11 meses de histórico mensal por métrica + turmas do colégio e cursos da faculdade como
>   metas por instituição. Substitui o seed `matricula`. Idempotente (reaproveita setor vazio).
> - **"Última atualização"** no lugar do seletor de data: Lançamentos sempre grava no período
>   atual e mostra "atualizado há X" por métrica; `/metricas` mostra o mesmo nos cards e no
>   cabeçalho do setor.
> - +3 telas de TV: `sector_targets`, `group_summary` (por instituição), `metric_spotlight`
>   (migration 0004 — `tv_screens.definition_id` + kinds novos).
> - **Cores no domínio do plugin**: `components/dashboard/chart-tokens.tsx` injeta `--cm-chart-1..8`
>   (oklch, tema-aware por `.dark`) via `<ChartTokens/>` no topo de cada superfície — não toca
>   `globals.css`/`theme.css`, sai junto com o plugin. `MetricTrend` colore por série.
> - Ainda a fazer na parte gráfica (pedido adiado pelo dono): mais densidade de cor nos painéis
>   de meta e no overview, e polir os layouts de TV.
>
> Ajustes feitos na implementação, ainda dentro do desenho:
> - `sector_groups` entrou já na Fase 1. "Metas" virou **aba própria** (Setores · Métricas ·
>   Metas · Lançamentos · Apresentação, dirigidas por `?tab=`).
> - `package.json` ganhou `db:{generate,migrate}:company-metrics` e perdeu os equivalentes de
>   `enrollment-dashboard` (F6).
> - **Fase 7 não alterou o schema do Broadcast.** O item `metrics-board` é gravado como um item
>   `webpage` comum (`url = /company-metrics/tv/{token}`) — sem migration, sem novo `sourceType`,
>   a view de saída já renderiza. O atalho é uma feature `add-metrics-board-playlist-item` +
>   um chip na UI de playlist que só aparece com `company-metrics` ativo. Mais simples e menos
>   invasivo que o `sourceType` novo previsto no §9.3, com o mesmo efeito.
> - `sector_groups.logo` e o **bloco de CMS** `company-metrics.target.board` ficaram sem UI
>   (colunas/gancho existem) — trabalho incremental.
> - Gráficos: sparkline SVG inline própria (`components/dashboard/metric-trend`), não `recharts`
>   (que está nas deps mas puxa peso pro bundle do telão).
>
> Este documento decidiu a forma do plugin: entidades e schema, modelo de delegação por setor, as
> três superfícies de consumo (admin, visualização interativa, saída para TV/Broadcast), estrutura
> de arquivos e faseamento. Um prompt por fase no apêndice.
>
> Segue as regras do `AGENTS.md` (fluxo de camadas §1, barrel §2, tokens de cor §3, mobile-first
> §4, DoD §6) e **reusa por cópia** (não por import — ver §0) dois precedentes já no código:
> - **`broadcast`** — delegação de "responsável" por recurso (`shared/scoped-authorization/`),
>   UX de admin de aba única gateada por permission, saída para TV por token fora do `(platform)`.
> - **`enrollment-dashboard`** — meta × realizado com composição de parcelas, slide de TV com
>   `PresentationCanvas` (escala uniforme, preenche qualquer proporção, inclusive embutido como
>   camada `webpage` do Broadcast), link de apresentação por token sem login. **Este plugin
>   substitui o `enrollment-dashboard`** — o caso "matrícula" passa a ser um uso do modelo geral
>   e o plugin antigo é desinstalado (§9).

---

## 0. Princípio: cada plugin existe sozinho

Regra dada pelo dono, acima de tudo neste documento:

- **`company-metrics` funciona 100% sem nenhum outro plugin instalado.** Não importa, não referencia
  e não depende de `broadcast` nem de `enrollment-dashboard` em runtime. Não tem `dependencies` no
  manifesto.
- **Nenhum plugin altera o outro.** O que `company-metrics` reaproveita dos precedentes
  (`PresentationCanvas`, o padrão `scoped-authorization`, os componentes de slide) entra por
  **cópia** para dentro de `src/plugins/company-metrics/`, nunca por `import` de
  `@/plugins/broadcast/*` ou `@/plugins/enrollment-dashboard/*` (o `eslint-plugin-boundaries` já
  bloqueia isso).
- **O Broadcast consome este plugin por rota**, como consome qualquer site: um item de playlist
  `webpage` apontando para `/company-metrics/tv/[token]`. É o Broadcast que sabe a URL; o
  `company-metrics` não sabe que o Broadcast existe.
- A **única exceção**, pedida explicitamente, é um atalho de conveniência **do lado do Broadcast**
  (§9.3): um seletor nativo de "painel de métricas" na tela de playlist, construído como feature
  **do Broadcast**, com dependência **opcional** e degradação graciosa quando `company-metrics`
  não está instalado. `company-metrics` continua sem saber que o Broadcast existe — só expõe uma
  função estável no seu barrel que qualquer consumidor pode chamar.

---

## 1. Objetivo

Um plugin onde a empresa acompanha **métricas internas por setor**. O administrador cria setores,
delega quem administra e quem lança dados em cada um, e cada setor modela suas próprias métricas
e metas. Três públicos consomem o dado:

1. **Operadores** (área administrativa) — cadastram métricas/metas e lançam valores. UX simples,
   no modelo do Broadcast.
2. **Gestores** (visualização interativa, mobile-first) — conferem o andamento, com RBAC/auth do
   core.
3. **TVs** (saída para o Broadcast Studio) — telas de leitura à distância, sem login.

Setores iniciais: **comercial, financeiro, marketing** (semeados). Depois: RH, secretaria. Mais
adiante: almoxarifado e pedagógico. **Nenhum setor novo exige código** — é uma linha em `sectors`
(ou o botão "novo setor" no admin).

Requisito transversal do enunciado: *"provavelmente vão existir métricas customizadas… definir o
relacionamento entre elas"*. O modelo abaixo resolve isso sem linguagem de fórmula nem editor de
grafo — só pickers e campos numéricos (regra do `AGENTS.md` / memória `feedback_admin_ux_no_dev_jargon`:
nada de JSON cru, nada de UUID colado).

---

## 2. Modelo de dados

Schema Postgres próprio do plugin: `company_metrics` (mesmo padrão de `broadcast`/`enrollment_dashboard`
— `pgSchema("company_metrics")`, migrations em `src/plugins/company-metrics/migrations`, aplicadas
no **install**, nunca no `vercel-build`).

### 2.1 Entidades

| Tabela | O que é | Campos-chave |
| --- | --- | --- |
| `sectors` | Um setor (comercial, financeiro…). | `id`, `key` (slug do nome, gerado — nunca digitado), `name`, `description`, `accent_color` (token? ver §11), `icon`, `position`, `archived_at` |
| `sector_members` | Delegação: quem pode o quê **naquele** setor. | PK `(sector_id, user_id)`, `role ∈ ('admin','editor','viewer')`, `assigned_at` |
| `sector_groups` | Agrupamento **opcional** dentro de um setor — com rótulo, logo e ordem próprios. É o que absorve "instituição" (Erasto/Fidelis) e "Fundamental I / Ensino Médio" do `enrollment-dashboard` (§9), e serve genérico: "Regional Sul" no comercial, "Matriz/Filial" no almoxarifado. | `id`, `sector_id`, `key`, `label`, `logo_media_id` (nullable), `position` |
| `metric_definitions` | Uma métrica que o setor acompanha ("Alunos matriculados", "Receita recorrente", "Leads"). | `id`, `sector_id`, `group_id` (nullable → `sector_groups`), `key`, `label`, `unit ∈ ('count','currency_brl','percent','days')`, `aggregation ∈ ('sum','last','average')`, `granularity ∈ ('daily','weekly','monthly')`, `direction ∈ ('up_good','down_good')`, `position`, `archived_at` |
| `metric_values` | Um valor lançado para uma definição, num período. É o que o `editor` atualiza. | `id`, `definition_id`, `period_start` (normalizado ao bucket da `granularity`), `value numeric`, `note`, `entered_by_user_id`, `entered_at`, `updated_at`; **uq `(definition_id, period_start)`** |
| `targets` | Uma meta do setor ("300 entradas no semestre"). | `id`, `sector_id`, `group_id` (nullable → `sector_groups`), `label`, `description`, `target_value numeric`, `period_start`, `period_end`, `on_track_threshold numeric default 0.85`, `position`, `archived_at` |
| `target_inputs` | **O relacionamento meta ↔ métricas.** Cada linha liga uma definição à meta, com peso e classificação. | PK `(target_id, definition_id)`, `weight numeric default 1`, `classification ∈ ('realized','at_risk','projected','subtract')`, `position` |
| `tv_boards` | Uma "playlist de telas" para uma TV. Cada board tem seu próprio `token`. | `id`, `token` (uuid sem hífen), `label`, `created_at` |
| `tv_screens` | Uma tela dentro de um board (o que rotaciona no telão). | `id`, `board_id`, `kind ∈ ('target_board','sector_kpis','overview')`, `sector_id` (nullable), `target_id` (nullable), `dwell_seconds int default 20`, `position` |

Sem FK cross-schema para `auth.users` / `media.files` (mesma decisão de `enrollment_dashboard.institutions.logo_media_id`
e `broadcast` — validado na aplicação via `getMediaAsset()` / `listUsers()`, nunca no banco).

### 2.2 O relacionamento entre métricas — o exemplo do enunciado

> "meta de entrada de 300 alunos… métrica de alunos matriculados, pendentes (falta documentação),
> ou ainda não efetuaram pagamento. Esses dados batem com a minha meta."

Modelagem:

```
targets:  { label: "Entradas 2026/2", target_value: 300, period: 2026-02..2026-07, on_track_threshold: 0.85 }

metric_definitions (setor comercial):
  A "Alunos matriculados"        unit=count  granularity=weekly  direction=up_good
  B "Pendentes (documentação)"   unit=count  granularity=weekly  direction=down_good
  C "Sem pagamento efetuado"     unit=count  granularity=weekly  direction=down_good

target_inputs (da meta "Entradas 2026/2"):
  { definition: A, weight: 1, classification: 'realized' }
  { definition: B, weight: 1, classification: 'at_risk'  }
  { definition: C, weight: 1, classification: 'at_risk'  }
```

O módulo puro `shared/metric-rollup.ts` (unit-testado, sem I/O — mesmo espírito de
`enrollment-dashboard/shared/enrollment-metrics.ts`) recebe a meta + seus `target_inputs` + os
`metric_values` do período e devolve:

```ts
type TargetRollup = {
  targetValue: number;         // 300
  realized: number;            // Σ inputs 'realized' × weight        → ex: 210 (matriculados)
  atRisk: number;              // Σ inputs 'at_risk' × weight          → ex: 90 (55 pendentes + 35 sem pgto)
  projected: number;           // Σ inputs 'projected' × weight
  subtract: number;            // Σ inputs 'subtract' × weight
  headline: number;            // = realized                          → barra principal 210/300
  optimistic: number;          // = realized + atRisk + projected − subtract → barra secundária 300/300
  gap: number;                 // targetValue − headline              → 90
  completion: number;          // headline / targetValue              → 0.70
  status: "met" | "on_track" | "below";  // faixa por on_track_threshold (default 0.85), igual goalStatus
};
```

Isso cobre o exemplo (e a maioria dos casos de "N métricas somam contra uma meta, algumas
contam firme, outras são risco") **sem** um editor de fórmula. O que **fica de fora desta
versão** (ver §8 Known Gaps): métrica **derivada de outra métrica** (ex: "taxa de conversão" =
`fechados ÷ leads` como uma `metric_definition` calculada). Se necessário, entra numa fase
posterior como `derived_definitions` — não vale super-projetar agora.

`aggregation` resolve "como os valores semanais viram um número do período": `sum` (leads,
entradas), `last` (estoque, saldo — vale o último lançamento), `average` (ticket médio, NPS).

---

## 3. Delegação por setor — administradores e editores

Segue **exatamente** o precedente do `broadcast` (`shared/scoped-authorization/`): permission ampla
que ignora atribuição + permission estreita que **só** vale com atribuição explícita. **Não** cria
`scopeType` novo no `rbac` core — `RBAC_SCOPE_TYPES` (`src/contexts/rbac/contracts/scope-types.ts`)
é decisão do core e hoje só tem `cms.category`; um plugin não se acrescenta lá (memória
`feedback_plugin_never_touches_core`). O padrão `broadcast` resolve o mesmo problema 100% dentro
do plugin.

### 3.1 Permissions (declaradas no manifesto, namespace `company-metrics.`)

| Permission | Quem tem | Pode |
| --- | --- | --- |
| `company-metrics.manage` | `admin` / `superadmin` (via papel em `/admin/rbac`) | Tudo, em todos os setores: criar/arquivar setor, **delegar membros** (admin/editor/viewer), configurar métricas/metas/telas, lançar dados. Ignora atribuição. |
| `company-metrics.contribute` | papel "editor pra cima" atribuído a um setor | Agir **só** nos setores em que a pessoa é `sector_member`. O que pode fazer lá depende do `role` da linha (ver 3.2). A permission **sozinha não dá acesso a nada** — precisa da atribuição também. |
| `company-metrics.read` | gestores | Abrir a visualização interativa (`/metricas`). Recortada aos setores atribuídos como `viewer`/`admin`/`editor`, salvo se a pessoa também tiver `company-metrics.manage` (aí vê tudo). |

### 3.2 `sector_members.role` — o segundo nível

Dentro de um setor a que a pessoa foi atribuída (e tendo `company-metrics.contribute`):

| `role` | Configura métricas/metas | Lança valores (`metric_values`) | Delega outros membros do setor |
| --- | --- | --- | --- |
| `admin` | ✅ | ✅ | ✅ (só editor/viewer; nunca outro admin — isso é `company-metrics.manage`) |
| `editor` | ❌ | ✅ | ❌ |
| `viewer` | ❌ | ❌ | ❌ (só enxerga na visualização interativa) |

`shared/scoped-authorization/index.ts` expõe, no molde de `authorizeAgendaActor`:

```ts
authorizeSectorActor(sectorId: string, min: "admin" | "editor"): Promise<AuthorizeActorResult>
// company-metrics.manage → passa sempre.
// senão: company-metrics.contribute + linha em sector_members com role >= min → passa; senão forbidden.

authorizeMetricValueActor(definitionId: string): // resolve sector_id pela definição, exige min "editor"
authorizeSectorConfigActor(sectorId: string):    // exige min "admin"
resolveVisibleSectorIds(): Promise<"all" | string[]>  // p/ recortar listagens e a visualização interativa
```

Só `company-metrics.manage` mexe em `sector_members` (feature `set-sector-members`, user picker —
sem UUID cru). Um `sector_member role='admin'` pode adicionar editor/viewer ao **seu** setor via
uma variante gateada por `authorizeSectorConfigActor`.

### 3.3 Gate de seção do admin

`src/platform/admin-shell/get-company-metrics-page-data.ts` (novo — mesmo arquivo-padrão de
`get-broadcast-page-data.ts`): `getAdminPageData()` + `isPluginActive("company-metrics")` + aceita
`company-metrics.manage` **ou** `company-metrics.contribute` **ou** `company-metrics.read`. A
página decide o resto a partir de `gate.actor.permissions` + setores atribuídos.

---

## 4. Superfície A — Área administrativa (`/admin/company-metrics`)

**Um único item de navegação** (regra do Broadcast: "não separe os links"). Uma página, com abas
montadas conforme a permission/atribuição do ator — Broadcast faz isso hoje em
`routes/admin/page.tsx`. Formulários em diálogo, campos guiados, no molde de
`enrollment-dashboard/routes/admin/*` (`create-*-dialog.tsx`, `*-fields.tsx`,
`edit-*-form.tsx`).

| Aba | Visível para | Conteúdo |
| --- | --- | --- |
| **Setores** | `company-metrics.manage` | Lista de setores; criar/editar/arquivar; **Membros** (user picker → admin/editor/viewer). |
| **Métricas** | `manage` ou `sector_member.admin` | Seleciona um setor → CRUD de `metric_definitions` (label, unidade, cadência, direção) e de `targets` + **construtor de meta**: escolhe as definições que compõem a meta, define `weight` e `classification` de cada uma (`realized` / `at_risk` / `projected` / `subtract`), define `target_value`, período e limiar. |
| **Lançamentos** | `manage`, `sector_member.admin` ou `.editor` | Seleciona setor + período → grade com cada definição e seu valor atual; edita o número inline + nota. **Mobile-first** (é onde alguém no celular atualiza "matriculados hoje"). Um `upsert-metric-value` por linha. |
| **Apresentação** | `manage` ou `sector_member.admin` | Cria `tv_boards`; monta a rotação de `tv_screens` (tipo, setor/meta, tempo); botão **copiar link** do board (`/company-metrics/tv/{token}`) — igual `copy-presentation-link-button.tsx` do enrollment. |

Todo `handler.ts` → `service.ts` → `store.ts`; `OperationResult<T>` em handler/service; teste
unitário do service + do handler onde há autorização/validação de borda (DoD §6).

---

## 5. Superfície B — Visualização interativa (`/metricas`, mobile-first, autenticada)

Rota **pública de plugin** (`route-table.public`, caminho completo `"metricas"`) — despachada pelo
catch-all do CMS, herda a shell do `(platform)` (header/nav/footer) de graça, o que é o certo:
gestor logado navegando. **Não** é `/admin/*` — gestor não é admin.

- A `page.tsx` (server component) chama `authorizeActor("company-metrics.read")` +
  `resolveVisibleSectorIds()`. Sem a permission → `notFound()`. Com escopo → só os setores
  atribuídos.
- View model de `features/dashboard/get-metrics-overview` (todos os setores visíveis, resumido) e
  `features/dashboard/get-sector-dashboard` (um setor: metas com `TargetRollup`, séries históricas
  de cada `metric_definition`, seletor de período).
- Interativo: filtro de período (mês/trimestre/semestre), expandir meta para ver a composição
  (matriculados / pendentes / sem pgto), linha do tempo por métrica.
- Componentes de gráfico/KPI vivem em `components/dashboard/` e são **compartilhados** com a TV
  (Superfície C) — mesmos cartões, densidades diferentes. Cor só via token shadcn (§3 do
  `AGENTS.md`); nada hardcoded.

`get-sector-dashboard/handler.ts` **tem** `authorizeActor` + recorte (diferente dos handlers
token-only do Broadcast/enrollment) — esta superfície é sempre autenticada.

---

## 6. Superfície C — Saída para TV / Broadcast

### 6.1 A página de TV

`src/app/company-metrics/tv/[token]/page.tsx` → `export { default } from "@/plugins/company-metrics/routes/tv/page"`.
Fora de `(platform)` de propósito (sem shell), **não** entra na `route-table` — idêntico a
`src/app/broadcast/out/[token]/` e `src/app/enrollment-dashboard/present/[token]/[institutionKey]/`.

- Acesso **só por token** (`tv_boards.token`), sem sessão — TV não faz login (regra dos dois
  precedentes). `features/presentation/get-tv-board/handler.ts` sem `authorizeActor` (token na URL
  é a credencial), no molde de `getPresentationAccessHandler`.
- Reaproveita o **`PresentationCanvas`** do enrollment (altura de referência 1080, escala
  uniforme, largura derivada da proporção real do container) — foi construído justamente para
  também funcionar embutido como camada `webpage` do Broadcast com a coluna de agenda aberta
  (proporção não-16:9). Segue o **tema do site**, sem tokens fixos de dark (memória
  `project_enrollment_dashboard_plugin`).
- Rotaciona os `tv_screens` do board (`dwell_seconds` cada). Atualização por **polling**
  (`setInterval`, ex. 30 s) — métrica não muda a cada segundo, não precisa do SSE/`output-bus` do
  Broadcast.
- Tipos de tela: `target_board` (uma meta em telão: número grande, barra realizado/risco/meta,
  status), `sector_kpis` (as principais métricas do setor em mosaico), `overview` (todos os
  setores, status por cor — semáforo).

### 6.2 Como o Broadcast consome — por rota, **mecanismo permanente**

O Broadcast Studio já tem um tipo de item de playlist `webpage` (URL em `<iframe>`). O operador do
Broadcast adiciona `/company-metrics/tv/{token}` como item `webpage` numa playlist, com a duração
que quiser. **Zero acoplamento**: o Broadcast trata a view igual a qualquer site externo, o
`company-metrics` não sabe que o Broadcast existe. Este caminho **nunca deixa de existir** — o
atalho da §9.3 é conforto, não substituto.

O bloco de CMS `company-metrics.target.board` (`blocks:` no manifesto, molde do
`birthdays.month.list`) segue a mesma ideia para embutir um painel numa página do CMS. Fase
posterior, independente do resto.

---

## 7. Estrutura de arquivos

```
src/plugins/company-metrics/
  manifest.ts            key "company-metrics", permissions (3), navigation (1 item), seeds (1),
                         migrationsPath "./migrations", compatibility ">=2.0.0 <3.0.0"
  index.ts               barrel — só handlers + tipos de contracts/. Nada de store/service/schema pra fora.
  drizzle.config.ts      schema "company_metrics", tracking "company_metrics_migrations"
  contracts/types.ts     SectorRecord, SectorMemberRole, SectorGroupRecord, MetricDefinitionRecord,
                         MetricValueRecord, TargetRecord, TargetInputRecord, TargetRollup,
                         TvBoardRecord, TvScreenRecord + view models (SectorDashboard,
                         MetricsOverview, TvBoardView)
  database/schema/index.ts
  migrations/
  seeds/{index.ts,example.ts}   comercial/financeiro/marketing + 2-3 definições e 1 meta de exemplo cada
  shared/
    slugify.ts
    metric-rollup.ts            PURO, unit-testado (o coração do §2.2)
    period.ts                   normaliza data → bucket da granularity; range → lista de buckets
    scoped-authorization/{index.ts,store.ts}
  features/
    sectors/{create-sector,update-sector,archive-sector,list-sectors,
             set-sector-members,list-sector-members}/{handler,service,store,types,validation}
    groups/{create-sector-group,update-sector-group,delete-sector-group,list-sector-groups}/…
    definitions/{create-metric-definition,update-metric-definition,
                 archive-metric-definition,list-metric-definitions}/…
    targets/{create-target,update-target,delete-target,list-targets}/…   (update-target grava target_inputs)
    values/{upsert-metric-value,list-metric-values}/…
    dashboard/{get-metrics-overview,get-sector-dashboard}/…              (handler COM authorizeActor + escopo)
    presentation/{get-tv-board,set-tv-screens,list-tv-boards,create-tv-board}/…  (get-tv-board sem auth: token)
  routes/
    route-table.ts        admin: [{ pattern: "", Component: asPluginPage(AdminPage) }]
                          public: [{ pattern: "metricas", Component: asPluginPage(ManagerViewPage) }]
    admin/page.tsx        + actions.ts + dialogs/forms/fields (molde enrollment-dashboard)
    public/page.tsx       /metricas — server component, authorizeActor + resolveVisibleSectorIds
    tv/page.tsx           /company-metrics/tv/[token] — PresentationCanvas + rotação + polling
  components/
    admin/…               sector-list, member-picker, definition-form, target-builder, value-grid
    dashboard/…           target-board, kpi-tile, metric-trend, status-badge  (compartilhados B + C)
    tv/tv-canvas.tsx

src/app/company-metrics/tv/[token]/page.tsx        shim de reexport (fora de (platform))
```

**Pontos de registro** (todo plugin edita — não é "core" no sentido da memória
`feedback_plugin_never_touches_core`, que se refere a `package.json`/`next.config.ts`/`theme.css`
etc.):

- `src/plugins/registry.ts` — `+ companyMetricsManifest`
- `src/plugins/route-registry.ts` — `+ "company-metrics": companyMetricsRouteTable`
- `src/platform/plugin-engine/plugin-seed-registry.ts` — registra o seed `example`
- `src/platform/admin-shell/get-company-metrics-page-data.ts` — novo gate de seção (arquivo por
  plugin, já é o padrão: `get-broadcast-page-data.ts`, `get-birthdays-page-data.ts`, …)

---

## 8. Faseamento

Cada fase fecha sozinha com a DoD do `AGENTS.md` §6 (camadas + `OperationResult`, `npm run lint`
/ `typecheck` / `test` verdes; migration via `drizzle-kit generate` na árvore do plugin com
contagem batendo; mobile-first; sem cor hardcoded).

| Fase | Entrega | Risco |
| --- | --- | --- |
| **1 — Setores + grupos + delegação** ✅ | `sectors`, `sector_groups`, `sector_members`, permissions, `scoped-authorization/`, aba **Setores** (CRUD de setor + grupos + membros), seed comercial/financeiro/marketing, gate de seção, item de nav. Sem métricas ainda. | baixo |
| **2 — Definições + lançamento** ✅ | `metric_definitions`, `metric_values`, `shared/period.ts`, setting de fuso, aba **Métricas** (CRUD de definição), aba **Lançamentos** (grade de entrada, mobile-first). `editor` já lança dado. | baixo/médio |
| **3 — Metas e composição** ✅ | `targets`, `target_inputs`, aba **Metas** (construtor de composição), `shared/metric-rollup.ts` puro + testes (cobre o exemplo das 300 entradas), `get-target-rollups` (view model reusável). | médio |
| **4 — Visualização interativa** ✅ | Rota `/metricas` (autenticada, recortada por setor), `get-metrics-overview` + `get-sector-dashboard`, overview + drill-down + sparkline de tendência + janela 3/6/12 meses. Testes unitários dos services (integração fica pro CI). | médio |
| **5 — Saída para TV** ✅ | `tv_boards`, `tv_screens`, aba **Apresentação** (montar rotação, copiar link), `/company-metrics/tv/[token]` com `PresentationCanvas` (copiado) + `router.refresh()` periódico, seguindo o tema. Consumido pelo Broadcast como item `webpage`. | médio |
| **6 — Substituição do `enrollment-dashboard`** ✅ | Seed "matricula" no modelo geral (Erasto/Fidelis como `sector_groups`, meta agregada por instituição com Rematriculados + Novas como composição `realized`). `enrollment-dashboard` removido por inteiro (plugin + shim + gate + scripts + registros); testes de integração retargetados. Ver §9.1. | médio |
| **7 — Atalho nativo no Broadcast** ✅ | `dependencies: [{ pluginKey: "company-metrics", type: "optional" }]` no manifesto do `broadcast`; feature `add-metrics-board-playlist-item` com `isPluginActive` (grava um item `webpage` — sem schema novo); chip "Painel de métricas" na UI de playlist só quando o plugin está ativo. `company-metrics` só expõe `listMetricsBoards()` no barrel. Bloco de CMS: não feito (incremental). Ver §9.3. | isolado |

Fases 6 e 7 são independentes entre si; ambas exigem a Fase 5.

---

## 9. Fronteira com outros plugins

### 9.1 Substituição do `enrollment-dashboard`

O `enrollment-dashboard` de hoje (`institutions` → `programs` com `goal`/`renewed`/`newEnrollments`,
slide de TV por token) é um **caso particular** do modelo geral:

| `enrollment-dashboard` | `company-metrics` |
| --- | --- |
| um `institution` (Colégio Erasto Gaertner, Faculdade Fidelis) | um `sector_group` dentro do setor "matrícula" (ou "secretaria") — carrega `label` + `logo_media_id` |
| `institution.programLabel` ("Turma"/"Curso") | rótulo do grupo / do setor |
| um `program` com `goal` | um `target` (`target_value = goal`, `group_id` = a instituição) |
| `program.groupLabel` ("Fundamental I") | um segundo nível de `sector_group`, ou um campo livre no `target` — decidir na Fase 6 pelo volume real |
| `program.renewed` | `metric_definition` "Rematriculados", input `realized` |
| `program.newEnrollments` | `metric_definition` "Novas matrículas", input `realized` |
| `goalStatus` (met / on-track / below, limiar 0.85) | `TargetRollup.status` (mesma faixa, `on_track_threshold`) |
| slide `present/[token]/[institutionKey]` | `tv_screen kind='target_board'` filtrado por `group_id`, num `tv_board` |

Passos da Fase 6:

1. **Seed de paridade** — `seeds/matricula.ts` recria Erasto/Fidelis no modelo geral (hoje o
   `enrollment-dashboard` é mock, conforme a memória do projeto — então é reconstruir o seed, não
   migrar produção). Se houver dado real no momento da execução: script one-off lê
   `enrollment_dashboard.*` e escreve via os `service.ts` da Fase 1–3.
2. **Componentes de slide** — os que valem a pena (`enrollment-ring`, `goal-vs-actual-chart`,
   `enrollment-composition-chart`, `presentation-canvas`) entram **por cópia** em
   `src/plugins/company-metrics/components/`, adaptados aos tipos de `contracts/`. Nenhum `import`
   de `@/plugins/enrollment-dashboard/*`.
3. **Retirar o plugin** — `enrollment-dashboard` sai do `PLUGIN_REGISTRY` / `PLUGIN_ROUTE_TABLES`,
   uninstall **Mode B** (dropa o schema `enrollment_dashboard`), e o shim
   `src/app/enrollment-dashboard/present/**` é apagado. `get-enrollment-dashboard-page-data.ts`
   também.
4. Qualquer TV que hoje aponta para `enrollment-dashboard/present/...` passa a apontar para o
   `tv_board` equivalente — troca de URL no item `webpage` do Broadcast, sem mudança no Broadcast.

### 9.2 O que `company-metrics` **não** faz

Não importa `@/plugins/broadcast/*` nem `@/plugins/enrollment-dashboard/*`. Não declara
`dependencies` no manifesto. Funciona instalado sozinho. O `PresentationCanvas` e o padrão
`scoped-authorization` são **cópias** adaptadas, não imports — o `eslint-plugin-boundaries` recusa
o contrário (prova em `cross-plugin-boundary.eslint.test.ts`).

### 9.3 Atalho nativo no Broadcast (`metrics-board`) — feature **do Broadcast**

Pedido explícito: facilitar a vida de quem monta playlist, sem colar URL. A regra "nenhum plugin
altera o outro" continua valendo — a mudança mora **inteiramente no `broadcast`**, feita numa
sessão de implementação do Broadcast, e trata `company-metrics` como fonte de dados **opcional**:

- No `broadcast`: novo valor `metrics-board` em `BROADCAST_PLAYLIST_ITEM_SOURCE_TYPES`; o item
  guarda um `boardId` e a view do Broadcast resolve a URL `/company-metrics/tv/{token}` na hora de
  renderizar (mesmo `<iframe>` do `webpage` — só a origem do valor muda).
- No manifesto do `broadcast`: `dependencies: [{ pluginKey: "company-metrics", type: "optional" }]`.
  Em runtime, `isPluginActive("company-metrics")` — se `false`, a opção `metrics-board` some da UI
  e itens antigos degradam para "fonte indisponível" (mesmo tratamento de um `media-asset`
  apagado).
- `company-metrics` expõe **uma** função estável no barrel: `listMetricsBoards()` →
  `{ token, label }[]` (e nada mais). Não sabe que o Broadcast existe; qualquer plugin/tela pode
  chamar. É o mesmo tipo de consumo cross-plugin que o AGENTS.md §2 já permite (barrel + `contracts/`
  + dependência declarada e opcional).
- **Alternativa mais geral, se surgir um 2º consumidor:** o Broadcast define um ponto de extensão
  "provedor de tela" que qualquer plugin registra. Só vale a pena com >1 provedor — hoje é
  YAGNI, fica anotado.

O caminho por rota (`webpage` + `/company-metrics/tv/[token]`, §6.2) **permanece** — o atalho é
conveniência de UI, não substituto, e é o único caminho enquanto a Fase 7 não roda.

---

## 10. Riscos e Known Gaps

- **Métrica derivada de métrica** (`taxa de conversão = fechados ÷ leads` como uma definição
  calculada) fica de fora. Hoje só **meta ← soma ponderada e classificada de definições**
  (`target_inputs`). Se virar requisito: fase própria com `derived_definitions` (expressão
  restrita a `+ − × ÷` entre definições do mesmo setor, ainda via picker — não texto livre).
- **Histórico/auditoria de lançamento**: `metric_values` guarda `entered_by`/`updated_at` mas
  sobrescreve o valor do período. Se precisar de trilha ("quem mudou de 210 pra 205 e quando"),
  adicionar `metric_value_revisions` — e chamar `recordAuditEvent` (o `AGENTS.md` §7 lista
  auditoria como trabalho incremental, não builtin).
- **Rate limiting / token da TV**: o `token` do `tv_board` não expira nem rotaciona sozinho
  (mesmo estado do link de apresentação do enrollment). Rotação manual ("gerar novo link") pode
  entrar na Fase 5; expiração automática não está no escopo.
- **`accent_color` do setor**: cor por setor é decisão de design — não pode ser hex cru em
  componente (§3 do `AGENTS.md`). Opções: (a) enum de N cores de marca mapeadas a tokens shadcn
  no `theme.css` do tema; (b) sem cor por setor, só ícone. **Recomendo (b) na Fase 1**, reabrir
  se fizer falta nos painéis.
- **Hospedagem**: sem estado em memória entre requisições (diferente do `output-bus` do
  Broadcast) — o polling da TV lê do banco a cada ciclo. Roda em serverless sem ressalva.
- **Fuso horário** dos buckets de período: `shared/period.ts` precisa de um fuso fixo de
  referência (o Broadcast aprendeu isso na marra — `broadcast.timezone`). Definir um setting
  `company-metrics.timezone` (default `America/Sao_Paulo`) na Fase 2.

---

## 11. Decisões a confirmar

1. **Delegação: tabelas do plugin (`sector_members`) no padrão `broadcast`** [recomendado] vs.
   `scopeType` novo no `rbac` core. Recomendo o padrão do plugin — não toca o core, já é
   precedente.
2. **Relacionamento entre métricas = meta ← soma ponderada/classificada de definições**
   [recomendado para v1] vs. já incluir métrica derivada de métrica na Fase 3.
3. **Cadência fixa por definição** (`daily`/`weekly`/`monthly`, o editor só vê "valor de agosto")
   [recomendado] vs. período livre por lançamento.
4. **`/metricas` dentro da shell do `(platform)`** (gestor logado navegando) [recomendado] vs.
   página isolada sem shell.
5. **Múltiplos `tv_boards`** (um token por TV — lobby ≠ TV do comercial) [recomendado] vs. um
   único token de apresentação para o plugin todo.
6. **`sector_groups` como camada opcional** [recomendado] — absorve "instituição" do
   `enrollment-dashboard` e serve genérico. Confirmar se um **segundo nível** de grupo
   ("Fundamental I" dentro de "Erasto") vale a tabela recursiva ou fica como campo livre no
   `target` (decisão adiável para a Fase 6).
7. **Substituir o `enrollment-dashboard` na Fase 6** (uninstall Mode B, seed de paridade)
   [recomendado] — confirmar que **não há dado de produção** a preservar (a memória do projeto diz
   "mock"); se houver, a Fase 6 ganha o script one-off de migração.
8. **Atalho `metrics-board` como feature do Broadcast, dependência opcional** (Fase 7)
   [recomendado] vs. deixar só o caminho por `webpage`/rota. O caminho por rota existe nos dois
   casos.
9. **Sem `accent_color` por setor na v1** [recomendado] vs. enum de cores mapeado a tokens.

---

## Apêndice — prompts para as sessões de implementação

> Um prompt por fase. Cada sessão é independente e fecha com a DoD do `AGENTS.md` §6. Rodar na
> ordem — 2 depende de 1, … 5 depende de 4; **6 e 7 dependem de 5 e são independentes entre si**.
> Ler antes, em toda fase: este documento (com atenção ao §0 — nada de `import` de outro plugin),
> `AGENTS.md` §1–§6, e os precedentes `src/plugins/broadcast/shared/scoped-authorization/` e
> `src/plugins/enrollment-dashboard/` (como **referência para copiar**, não para importar).

### Fase 1 — Setores + grupos + delegação

```
Implementar a Fase 1 de docs/metricas-internas-plugin.md. Criar o plugin company-metrics:
manifest.ts (key "company-metrics", 3 permissions do §3.1, 1 item de navigation "Métricas
Internas" no grupo plugins, seed "example", migrationsPath "./migrations", compatibility
">=2.0.0 <3.0.0", SEM dependencies — §0), index.ts (barrel), drizzle.config.ts (schema
"company_metrics").

Schema (database/schema/index.ts): sectors + sector_groups + sector_members conforme §2.1.
npm run db:generate:company-metrics; conferir contagem em src/plugins/company-metrics/migrations.

Features (fluxo handler→service→store→types, OperationResult): sectors/{create-sector,
update-sector,archive-sector,list-sectors,set-sector-members,list-sector-members} e
groups/{create-sector-group,update-sector-group,delete-sector-group,list-sector-groups}.
set-sector-members e a config de setor/grupo gateadas por company-metrics.manage OU
authorizeSectorConfigActor; list-sectors recorta por resolveVisibleSectorIds().

shared/scoped-authorization/{index.ts,store.ts} no molde de broadcast (CÓPIA adaptada, sem
import de @/plugins/broadcast): authorizeSectorActor, authorizeSectorConfigActor,
authorizeMetricValueActor (stub p/ Fase 2), resolveVisibleSectorIds.

Registros: src/plugins/registry.ts, src/plugins/route-registry.ts,
src/platform/plugin-engine/plugin-seed-registry.ts,
src/platform/admin-shell/get-company-metrics-page-data.ts (molde get-broadcast-page-data.ts).

routes/route-table.ts (admin: [""]), routes/admin/page.tsx com só a aba Setores (CRUD de setor
+ grupos + diálogo de membros com user picker via listUsers do @/contexts/auth — sem UUID cru).

seeds/example.ts: comercial, financeiro, marketing.

Testes: service de create-sector/set-sector-members, handler de set-sector-members
(autorização), unit de scoped-authorization. NÃO fazer: métricas, metas, TV, /metricas.
```

### Fase 2 — Definições de métrica + lançamento de dados

```
Implementar a Fase 2 de docs/metricas-internas-plugin.md. Pré: Fase 1 mergeada.

Schema: metric_definitions + metric_values (§2.1), uq (definition_id, period_start). Setting
company-metrics.timezone (default "America/Sao_Paulo") via @/contexts/settings.
db:generate:company-metrics, conferir contagem.

shared/period.ts: normaliza Date → início do bucket da granularity no fuso configurado;
expande um range em lista de buckets. Unit-testado.

Features: definitions/{create,update,archive,list}-metric-definition (config gateada por
authorizeSectorConfigActor); values/{upsert-metric-value,list-metric-values}
(upsert gateado por authorizeMetricValueActor — resolve o setor pela definição, exige role
>= editor).

routes/admin/page.tsx: aba Métricas (CRUD de definição, diálogos no molde enrollment-dashboard)
e aba Lançamentos (grade setor+período, edição inline do valor + nota, mobile-first —
grid-cols base sem prefixo, sm/md/lg crescentes).

Testes: service de upsert-metric-value (bucket correto, upsert idempotente), handler
(autorização por role de setor), period.ts. NÃO fazer: targets, rollup, TV, /metricas.
```

### Fase 3 — Metas e composição

```
Implementar a Fase 3 de docs/metricas-internas-plugin.md. Pré: Fase 2 mergeada.

Schema: targets + target_inputs (§2.1). db:generate:company-metrics, conferir contagem.

shared/metric-rollup.ts: PURO, sem I/O. Recebe target + target_inputs + metric_values do
período e devolve TargetRollup (§2.2: realized/atRisk/projected/subtract/headline/optimistic/
gap/completion/status por on_track_threshold). Unit-testado cobrindo o exemplo das 300
entradas (matriculados realized, pendentes+sem-pgto at_risk).

Features: targets/{create-target,update-target,delete-target,list-targets}. update-target
grava as linhas de target_inputs (weight + classification por definição). Gateado por
authorizeSectorConfigActor.

routes/admin/page.tsx aba Métricas: construtor de meta — seleciona definições do setor,
define weight e classification (realized/at_risk/projected/subtract) de cada uma, target_value,
período, limiar. Picker, sem texto de fórmula.

Testes: metric-rollup (vários cenários), service de update-target (persistência das inputs).
```

### Fase 4 — Visualização interativa `/metricas`

```
Implementar a Fase 4 de docs/metricas-internas-plugin.md. Pré: Fase 3 mergeada. Ler regra 10
(composição) e 13 (gate de página) do venore-docks.md.

Features dashboard/: get-metrics-overview (todos os setores visíveis, resumo com TargetRollup)
e get-sector-dashboard (um setor: metas + séries históricas por definição + período).
Handlers COM authorizeActor("company-metrics.read") + recorte por resolveVisibleSectorIds
(diferente dos handlers token-only). OperationResult.

routes/route-table.ts: public: [{ pattern: "metricas", Component: asPluginPage(ManagerViewPage) }].
routes/public/page.tsx: server component, authorizeActor + escopo; notFound() sem permissão.
Mobile-first. Filtro de período, expandir meta -> composição, linha do tempo por métrica.
components/dashboard/ (target-board, kpi-tile, metric-trend, status-badge) — cor só via token
shadcn, nada hardcoded.

Testes de integração (npm run test:integration, TEST_DATABASE_URL): gestor com company-metrics.read
escopado a "comercial" não vê "financeiro"; com company-metrics.manage vê tudo; sem a permission
recebe notFound. Unit dos services.
```

### Fase 5 — Saída para TV

```
Implementar a Fase 5 de docs/metricas-internas-plugin.md. Pré: Fase 4 mergeada.

Schema: tv_boards + tv_screens (§2.1). db:generate:company-metrics, conferir contagem.

Features presentation/: create-tv-board, list-tv-boards, set-tv-screens (gateados
authorizeSectorConfigActor OU company-metrics.manage), get-tv-board (SEM authorizeActor —
acesso por token na URL, molde de getPresentationAccessHandler; resolve os screens do board
em view models já prontos com TargetRollup).

src/app/company-metrics/tv/[token]/page.tsx: shim reexportando
@/plugins/company-metrics/routes/tv/page (fora de (platform), NÃO na route-table).
routes/tv/page.tsx: COPIAR o padrão do PresentationCanvas do enrollment-dashboard para
src/plugins/company-metrics/components/tv/ (escala uniforme, preenche a proporção) — sem
import de @/plugins/enrollment-dashboard. Rotação dos tv_screens por dwell_seconds, refresh por
polling (~30s). Segue o tema do site — sem token fixo de dark.

routes/admin/page.tsx aba Apresentação: cria board, monta rotação, botão copiar link
(/company-metrics/tv/{token}) no molde de copy-presentation-link-button.tsx.

Documentar no README do plugin: adicionar o link como item "webpage" numa playlist do
Broadcast Studio. NÃO alterar o plugin broadcast nesta fase.

Testes: service de set-tv-screens, get-tv-board (token válido/inválido), unit dos view models.
```

### Fase 6 — Substituição do `enrollment-dashboard`

```
Implementar a Fase 6 de docs/metricas-internas-plugin.md (§9.1). Pré: Fase 5 mergeada. Ler
antes: docs do projeto sobre enrollment-dashboard, o próprio src/plugins/enrollment-dashboard/,
e a memória de plugin install/uninstall (uninstall Mode B).

1. seeds/matricula.ts em company-metrics: recria Erasto Gaertner e Faculdade Fidelis como
   sector_groups do setor "matrícula" (criar o setor se não existir), cada turma/curso como um
   target (target_value = goal, group_id = a instituição), com metric_definitions
   "Rematriculados" e "Novas matrículas" (ambas input classification 'realized'). Registrar o
   seed no manifesto e no plugin-seed-registry.
2. Se houver dado real em enrollment_dashboard.* no momento: scripts/migrate-enrollment.mjs
   one-off lê institutions/programs e escreve via os service.ts das Fases 1–3 (nunca INSERT
   cru). Se for só mock, pular — o seed cobre.
3. components/: portar POR CÓPIA para src/plugins/company-metrics/components/ os que valem
   (enrollment-ring, goal-vs-actual-chart, enrollment-composition-chart, presentation-canvas),
   adaptados aos tipos de contracts/. Zero import de @/plugins/enrollment-dashboard.
4. Retirar enrollment-dashboard: remover de PLUGIN_REGISTRY e PLUGIN_ROUTE_TABLES, rodar
   uninstall Mode B (dropa schema enrollment_dashboard), apagar src/app/enrollment-dashboard/**,
   src/platform/admin-shell/get-enrollment-dashboard-page-data.ts e src/plugins/enrollment-dashboard/**.
5. Ajustar testes que referenciam o plugin removido.

Testes: seed matricula.ts produz os TargetRollup esperados (met/on-track/below por instituição);
integração de que /metricas e a TV mostram os grupos. NÃO tocar no broadcast.
```

### Fase 7 — Atalho nativo no Broadcast (`metrics-board`)

```
Implementar a Fase 7 de docs/metricas-internas-plugin.md (§9.3). Pré: Fase 5 mergeada (não
depende da 6). ESTA É UMA SESSÃO DO PLUGIN broadcast — a mudança mora toda lá.

Em company-metrics (mínimo): exportar no barrel index.ts a função listMetricsBoards() ->
{ token: string; label: string }[] (lê tv_boards). Só isso. Nada mais muda no company-metrics.

Em broadcast:
1. manifest.ts: dependencies: [{ pluginKey: "company-metrics", type: "optional" }].
2. contracts/types.ts: + "metrics-board" em BROADCAST_PLAYLIST_ITEM_SOURCE_TYPES. Coluna
   metricsBoardToken (ou reaproveitar url resolvendo na view). Migration do broadcast.
3. feature add-metrics-board-playlist-item/ (molde de add-webpage-playlist-item) — em runtime
   checa isPluginActive("company-metrics"); se inativo, recusa com erro claro. Import só do
   barrel @/plugins/company-metrics.
4. UI da playlist: opção "Painel de métricas" só aparece se isPluginActive("company-metrics");
   select de board via listMetricsBoards(). Item com plugin inativo degrada como "fonte
   indisponível" (mesmo tratamento de media-asset apagado).
5. A view de saída renderiza o iframe de /company-metrics/tv/{token} — mesmo componente do
   sourceType webpage.

+ opcional, se sobrar tempo: bloco de CMS company-metrics.target.board no manifesto do
company-metrics (molde birthdays.month.list).

Testes: add-metrics-board-playlist-item com plugin ativo/inativo; a UI esconde a opção sem o
plugin. O caminho webpage/rota continua funcionando intacto.
```
