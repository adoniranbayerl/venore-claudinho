# RBAC com escopo por recurso — documento de design

> Status: **aprovado (2026-08-27).** Opções recomendadas das 6 questões da §7 valem como
> decididas, salvo indicação em contrário. Implementação segue o faseamento da §6.
> **Fase A concluída (2026-08-28)** — papéis `editor`/`author` de sistema, aliases canônicos de
> exibição (Overlord/Administrador/Editor/Autor/Membro) no self-heal, `EDITOR_/AUTHOR_BASE_PERMISSION_KEYS`,
> `scripts/seed-role-display-names.mjs` aposentado. `editor`/`author` ainda **globais** no CMS —
> o recorte por categoria é a Fase C.
> **Fase B concluída (2026-08-28)** — infra de escopo **dormente**: tabela `rbac.role_assignment_scopes`
> (migration `drizzle/0035_parallel_doctor_octopus.sql`), `contracts/scope-types.ts`
> (`RBAC_SCOPE_TYPES`, só `cms.category`), `UserRbacContext.scopedPermissions` montado em
> `get-user-context` (store faz uma 2ª query, view aplica a regra D2), `authorizeActor(perm, scope?)`
> + `resolveScope(perm, scopeType)` + erro `rbac.authorization.forbidden_scope`, features
> `assign-scope-to-role-assignment` / `remove-scope-from-role-assignment` (gated `rbac.roles.assign`),
> barrel `rbac/index.ts` exportando tudo. **Nenhum call site passa `scope`** — comportamento do
> sistema idêntico ao de antes.
> **Fase C concluída (2026-08-28)** — recorte por categoria do CMS ligado. `resolveScopeForActor(actorId, …)`
> (irmão de `resolveScope` que recebe o id explícito), helper `contexts/cms/shared/scoped-authorization`
> (`assertCmsCategoryScope`), enforcement nos `service.ts` de escrita de entries/categorias
> (`create/update/update-composition/archive/delete-entry`, `publish/schedule-entry` com
> `cms.entries.publish`, `create-category` só global), `list-entries-for-admin` + novo
> `list-categories-for-admin` recortados por escopo, `getCmsPageData` anexa `cmsCategoryScope` no
> gate, UI de atribuição em `/admin/rbac` com multi-select de categorias por nome
> (`get-rbac-scope-options` compõe cms+rbac em `platform/`). D6 aplicada: `publish/schedule-entry`
> deixaram de aceitar `cms.entries.manage` como atalho. **Enforcement mora no `service.ts`, não no
> `handler.ts`** — ver §4.4 e o checklist da §6. Fase D não implementada.
> Origem: `docs/issues.md:258-268` ("Sobre Papéis e Permissões") + gap em aberto registrado em
> `docs/venore-docks.md` ("Modelo de RBAC" → *"permission com escopo dentro de um recurso … essa
> decisão merece um documento próprio"*) e em `docs/venore-docks.md` → "Ainda não coberto".
>
> Este documento decide **onde mora o escopo**, **como `authorizeActor` passa a enxergá-lo**, o
> **impacto** nos loaders de admin e nas telas do CMS, a **migração** dos papéis atuais e o
> **faseamento**. O entregável desta rodada é só este arquivo — a implementação começa depois do
> seu aval.

---

## 1. Objetivo

Sair do RBAC **flat** de hoje (superadmin incondicional + união de *permission keys* globais por
recurso) para um modelo onde um papel/usuário pode ter uma permission **limitada a um subconjunto
de instâncias** de um recurso — concretamente: um Editor que só enxerga e modera as categorias do
CMS atribuídas a ele, um Autor que só cria rascunho nessas mesmas categorias, sem nunca ver as
outras.

Modelo alvo pedido em `issues.md`:

| Papel (nome interno) | Alias de exibição | O que é | Escopo |
| --- | --- | --- | --- |
| `superadmin` | Overlord | Dono da instância / quem instalou. Acesso irrestrito. | — (ignora escopo) |
| `admin` | Administrador | Opera uma ou mais **seções** do site (Admin do Academy, Admin Editorial…). | Global hoje; por seção na Fase D |
| `editor` | Editor | Modera um ou mais setores editoriais, **vinculado a categoria(s) do CMS**. Coordena autores. Não enxerga categoria não atribuída. | Por categoria do CMS |
| `author` | Autor | Cria e edita nas categorias atribuídas, **só rascunho — não publica**. | Por categoria do CMS |
| `member` | Membro | Consumidor autenticado. Sem acesso administrativo. | — |

Requisitos que não podem regredir:

- **Papéis personalizados continuam possíveis** (`create-custom-role` + `update-role-permissions`
  intactos).
- **Nome interno (`key`) + alias de exibição (`name`)** — já existe parcialmente (ver §2.4).
- Instalação nova e todo ambiente já existente continua funcionando **sem nenhuma linha de
  escopo** — escopo é 100% aditivo.

---

## 2. Estado atual (levantado do código)

### 2.1 Schema — `src/contexts/rbac/database/schema/index.ts`

```
rbac.roles             (id, key UNIQUE, name, is_system, timestamps)
rbac.role_permissions  (role_id → roles.id, permission_key)          PK (role_id, permission_key)
rbac.user_roles        (user_id → auth.users.id, role_id → roles.id) PK (user_id, role_id)
```

`permission_key` é **string opaca** — o catálogo (`src/contexts/rbac/contracts/permissions.ts`,
`RBAC_PERMISSIONS`) é só rótulo pra UI; nada no schema referencia recurso do CMS. Isso é o que
mantém a barreira `eslint-plugin-boundaries` (RBAC não importa `contexts/cms`).

### 2.2 Resolução — `get-user-context` + cache

- `store.ts` → um `SELECT` com `user_roles ⨝ roles ⟕ role_permissions` por `user_id`.
- `view.ts` (`toUserRbacContext`) → achata pra:
  ```ts
  type UserRbacContext = {
    userId: string;
    roles: RoleRef[];          // { id, key, name, isSystem }
    permissions: string[];     // união de todas as permission keys, sem vínculo com o papel
    isSuperadmin: boolean;     // roles.some(r => r.key === "superadmin")
  };
  ```
- `user-context-cache.ts` → cache em memória, TTL 5 min, chave = `userId`. Invalida em
  `invalidateUserContext(userId)` — já chamado por `assign-role-to-user`, `remove-role-from-user`,
  `rename-role`, `assign-default-role`.

### 2.3 `authorizeActor` — `src/contexts/rbac/authorize-actor.ts`

```ts
authorizeActor(requiredPermission: string | string[]): Promise<
  | { authorized: true; actorId: string }
  | { authorized: false; error: { code; message } }
>
```

Regra: `isSuperadmin` passa incondicional; senão precisa ter **qualquer uma** das keys pedidas
(OR). ~80 call sites (todos os `handler.ts` de escrita dos contexts e plugins). Nenhum passa
contexto de recurso hoje.

Loaders de página admin (`src/platform/admin-shell/get-*-page-data.ts`) **não** chamam
`authorizeActor` — leem `getUserContext` direto e fazem `context.permissions.includes(...)` /
`isSuperadmin`:

- `get-admin-page-data.ts` → `platform.admin.access` (memoizado por request via `cache()`).
- `get-cms-page-data.ts` → passa se tiver **qualquer** de
  `cms.{content-types,categories,entries,menus}.manage`.
- `get-rbac-page-data.ts` → `rbac.roles.manage`. Etc.

### 2.4 Aliases de exibição — o que já existe

- `roles.key` = identificador interno estável (checagens tipo `role.key === "superadmin"`).
- `roles.name` = rótulo de exibição, editável por `rename-role` (feature completa:
  handler/service/store/view + invalidação de cache dos usuários do papel). Comentário no
  `service.ts` deixa explícito: *"renomeia só o label de exibição; `key` continua o
  identificador interno"*.
- `scripts/seed-role-display-names.mjs` — script **one-off** que faz
  `UPDATE rbac.roles SET name = …` para `superadmin→"Overlord"`, `admin→"Administrador"`,
  `member→"Membro"`. **Não** roda no bootstrap automático; `ensureBaseRbacDataSeeded` semeia
  `name` como `"Super Admin"`/`"Admin"`/`"Member"`.
- `SYSTEM_ROLE_KEYS = ["superadmin", "admin", "member"]` (`contracts/roles.ts`) — 3 papéis de
  sistema, `is_system = true`, não deletáveis.

**Conclusão:** a mecânica de "interno vs. alias" já existe e funciona; o que falta é (a) os alias
canônicos entrarem no self-heal em vez de um script solto, e (b) os papéis `editor`/`author`
existirem.

### 2.5 Precedente de escopo já no código — plugin `broadcast`

`src/plugins/broadcast/shared/scoped-authorization/` já resolve exatamente este problema, em
escala de plugin:

- Permission **ampla** (`broadcast.manage`) → passa sempre, ignora atribuição.
- Permission **estreita** (`broadcast.agenda.manage`, `broadcast.outputs.manage`,
  `broadcast.playlists.manage`) → só passa se o usuário estiver **explicitamente atribuído** ao
  recurso, via tabelas `broadcast_{agenda,output,playlist}_editors (resourceId, userId)`.
- `authorizeAgendaActor(agendaId)` = `authorizeActor("broadcast.manage")` OR
  (`authorizeActor("broadcast.agenda.manage")` AND `isUserAssignedToAgenda(agendaId, actorId)`).
- Listagens filtram pelos ids atribuídos (`findAgendaIdsAssignedToUser`) quando o ator só tem a
  permission estreita.
- A atribuição é **por usuário** (não por papel) e só quem tem `broadcast.manage` mexe nela
  (`set-agenda-editors`).

Este documento **generaliza esse padrão para o core `rbac`**, para o CMS (e depois outros
domínios) reusarem em vez de cada um recriar suas tabelas `*_editors`.

---

## 3. Decisões de design

### D1 — Onde mora o escopo: tabela satélite em `rbac`, vínculo por **(usuário × papel)**

Nova tabela no schema `rbac`:

```ts
export const roleAssignmentScopes = rbacSchema.table(
  "role_assignment_scopes",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    // Namespace opaco do tipo de recurso — ex: "cms.category". Mesma natureza de
    // role_permissions.permission_key: rbac não conhece o schema do dono do recurso.
    scopeType: text("scope_type").notNull(),
    // id da instância no domínio dono (ex: cms.categories.id). Sem FK cross-schema —
    // mesma decisão de entries.mediaId / menu_items.contentId.
    resourceId: text("resource_id").notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.roleId, t.scopeType, t.resourceId] }),
    // FK composta pro vínculo user_roles: escopo só existe se a atribuição do papel existe.
    foreignKey({ columns: [t.userId, t.roleId], foreignColumns: [userRoles.userId, userRoles.roleId] }).onDelete("cascade"),
  ],
);
```

**Por que (usuário × papel) e não no papel:**

1. `issues.md` fala em *"as categorias devem ser atribuídas **a ele**"* (a pessoa), não "o papel
   Editor de Novidades já carrega a categoria".
2. É o mesmo shape do precedente `broadcast` (atribuição por usuário, permission pelo papel).
3. Mantém papel **reutilizável**: um único papel `editor`, N pessoas, cada uma com o seu conjunto
   de categorias — sem explodir o catálogo de papéis em "Editor de Novidades", "Editor de
   Eventos", "Editor de Novidades+Eventos"…
4. `user_roles` (PK `user_id, role_id`) fica **intacto**; escopo é tabela satélite com FK composta
   pra ele — remover o papel do usuário remove os escopos em cascata, de graça.
5. Papéis personalizados continuam funcionando sem tocar em nada: se um papel custom tiver uma
   permission "escopável", a mesma UI de atribuição de escopo aparece.

> **Alternativa considerada e recusada:** escopo em `role_permissions` (a permission do papel já
> nasce amarrada a um recurso). Recusada porque quebra "papel reutilizável", contradiz o texto do
> `issues.md`, e obrigaria papel novo por combinação de categorias.

### D2 — Semântica: "tem linha de escopo daquele tipo pra aquele papel" **estreita**; ausência = global

Para um par `(permissionKey P, scopeType T)` e um ator:

- **superadmin** → sempre global (nem consulta escopo).
- Para **cada papel** que o ator possui e que concede `P`:
  - se esse `(userId, roleId)` tem ≥1 linha em `role_assignment_scopes` com `scope_type = T`
    → esse papel contribui **só** com aqueles `resourceId`s.
  - senão → esse papel contribui com **global**.
- **Efetivo** = união das contribuições. Se qualquer papel contribuiu "global", o ator tem `P`
  global para `T`.

Consequências:

- `admin` com `cms.entries.manage` e **zero** linhas de escopo → global, **idêntico a hoje**.
- `editor` com `cms.entries.manage` + linhas `cms.category` `[Novidades, Eventos]` → acesso só a
  essas duas.
- Ator que é `admin` **e** `editor` → o `admin` dá global, o escopo do `editor` é irrelevante
  (não subtrai). Escopo **nunca tira** acesso que outro papel já deu amplo — só **adiciona**
  alcance a um papel que, sozinho, seria estreito.

> **Alternativa considerada:** chave estreita explícita à la `broadcast`
> (`cms.entries.manage` amplo + `cms.entries.manage.scoped` estreito). Recusada para o core
> porque dobraria o catálogo de permissions do CMS e obrigaria todo papel custom a escolher a
> chave certa. A regra "presença de linha estreita" tem um footgun (adicionar um escopo a um papel
> global-por-engano o estreita) — mitigado deixando a UI explícita ("Este papel fica limitado às
> categorias marcadas") e **nunca** anexando escopo aos papéis `admin`/`superadmin`.

### D3 — `authorizeActor` ganha 2º parâmetro opcional; nasce um `resolveScope` para listagens

Assinatura retrocompatível:

```ts
authorizeActor(
  requiredPermission: string | string[],
  scope?: { type: string; resourceId: string },
): Promise<AuthorizeActorResult>   // shape inalterado
```

- **Sem `scope`** → comportamento atual **bit a bit** (`isSuperadmin` ou `permissions` inclui a
  key). Um editor "escopado-só" **passa** `authorizeActor("cms.entries.manage")` sem 2º arg —
  isso é aceitável para gates de "pode entrar nesta seção do admin?", mas **handlers de escrita
  que mexem numa categoria específica DEVEM passar o `scope`** (ver §4.4 e o item de checklist na
  §6).
- **Com `scope`** → superadmin passa; senão resolve o efetivo de `(P, scope.type)` pela regra D2
  e exige `global` OU `scope.resourceId ∈ efetivo`. Erro novo:
  `code: "rbac.authorization.forbidden_scope"`.

Para **filtrar listagens** (não é um sim/não, é "quais ids"):

```ts
resolveScope(permissionKey: string, scopeType: string): Promise<
  | { kind: "global" }                              // superadmin, ou algum papel dá amplo
  | { kind: "scoped"; resourceIds: string[] }       // união dos ids permitidos
  | { kind: "none" }                                // não tem a permission de jeito nenhum
>
```

Vive em `src/contexts/rbac` (exportado pelo barrel), lê `getUserContext`.

### D4 — `UserRbacContext` ganha `scopedPermissions`; `permissions` continua existindo

`store.ts` do `get-user-context` passa a trazer também as linhas de `role_assignment_scopes` do
usuário (LEFT JOIN por `user_id`, agrupável por `role_id`). `view.ts` calcula:

```ts
type UserRbacContext = {
  userId: string;
  roles: RoleRef[];
  permissions: string[];        // INALTERADO — união de keys (global OU escopada), p/ back-compat
  isSuperadmin: boolean;
  // NOVO — só entra key que tem ao menos um papel concedendo-a
  scopedPermissions: Record<string, {
    // por scopeType: "global" (algum papel concede amplo) ou lista de ids (união dos papéis estreitos)
    [scopeType: string]: "global" | string[];
  }>;
};
```

Todos os ~15 call sites de `context.permissions.includes(...)` (loaders de admin, nav) continuam
válidos sem mudança — um editor escopado aparece com `cms.entries.manage` em `permissions`, então
**vê o item de menu e entra na seção CMS**; o recorte fino acontece nas telas (§4.3/§4.4).

`user-context-cache` não muda de forma — só passa a cachear o objeto maior. **Invalidação**: as
novas features `assign-scope-to-role-assignment` / `remove-scope-from-role-assignment` chamam
`invalidateUserContext(userId)`, igual as de papel já fazem.

### D5 — Catálogo de `scopeType` mora em `contracts/`, resolução de instância fica no dono

`src/contexts/rbac/contracts/scope-types.ts` (novo) declara os tipos válidos como rótulo/UI, do
mesmo jeito que `RBAC_PERMISSIONS`:

```ts
export const RBAC_SCOPE_TYPES = [
  { type: "cms.category", label: "Categoria do CMS",
    scopablePermissionKeys: ["cms.categories.manage", "cms.entries.manage", "cms.entries.publish"] },
] as const;
```

`rbac` **não** resolve "quais categorias existem / seus nomes" — isso é composição em
`platform/` (um `get-*-page-data` que chama `listCategories()` do barrel `@/contexts/cms` +
`listRoles()` do barrel `@/contexts/rbac`), servindo o multi-select da tela de atribuição. Mesmo
arranjo que `broadcast` usa para `set-agenda-editors` e que a regra 10 de composição
(`venore-docks.md`) autoriza.

### D6 — Editor vs. Autor é diferença de **permission**, não de escopo

Ambos escopados por `cms.category`. A distinção:

| | `cms.entries.manage` (escopada) | `cms.entries.publish` (escopada) | `cms.categories.manage` (escopada) |
| --- | --- | --- | --- |
| `editor` | ✅ | ✅ | ✅ (edita a própria categoria, não cria/apaga) |
| `author` | ✅ | ❌ | ❌ |

`cms.entries.publish` **já existe** e `publish-entry`/`schedule-entry` já exigem
`["cms.entries.publish", "cms.entries.manage"]` (OR). **Problema:** hoje o OR com
`cms.entries.manage` faz o Autor (que tem `cms.entries.manage`) publicar. Ajuste necessário na
Fase C: `publish-entry` passa a exigir `cms.entries.publish` **e** o `scope` da categoria da
entry — deixa de aceitar `cms.entries.manage` como atalho. `admin`/`superadmin` seguem publicando
(têm `cms.entries.publish` global / são superadmin).

### D7 — "Administrador de seção" = escopo `admin.section`, adiado para a Fase D

Não há entidade "seção" modelada hoje. Direção proposta (detalhe fica pra Fase D, provavelmente
depois do rename CMS→Editorial já previsto no roadmap):

- `scopeType: "admin.section"`, `resourceId ∈ {"cms","academy","media",...}` (as áreas do
  `admin-navigation-registry`).
- `authorizeActor("platform.admin.access", { type: "admin.section", id: "academy" })` e os
  loaders `get-*-page-data` honrando o escopo.
- O `admin-navigation-registry` passa a taggear cada grupo com a sua seção, e o filtro de nav
  usa `scopedPermissions["admin.section"]`.

### D8 — Papéis `editor`/`author`: **pré-semeados, `is_system = true`, deletáveis com trava**

`SYSTEM_ROLE_KEYS` vira `["superadmin", "admin", "member", "editor", "author"]`.

- Isso **altera** o invariante "3 papéis de sistema" do `venore-docks.md` → o doc de arquitetura
  ganha uma nota apontando pra cá (item da Definition of Done abaixo).
- `superadmin` continua com a trava dura existente (`remove-role-from-user` recusa deixar o
  sistema sem superadmin). `admin`/`member`/`editor`/`author`: `is_system = true` só impede a
  key de ser reciclada e marca na UI como "papel base"; permanecem editáveis
  (`rename-role`, `update-role-permissions`) e a exclusão continua com a regra atual.
- Alias canônico via self-heal (ver D9).

> **Alternativa:** deixá-los como papéis **custom pré-semeados** (`is_system = false`), sem mexer
> em `SYSTEM_ROLE_KEYS` nem no `venore-docks`. Mais barato, mas um `editor`/`author` apagado por
> engano não se auto-cura e o modelo de `issues.md` deixa de ser garantido. Recomendo `is_system`.

### D9 — Alias canônico entra no `ensureBaseRbacDataSeeded`; `seed-role-display-names.mjs` é aposentado

`SYSTEM_ROLE_NAMES` em `ensure-base-rbac-data.ts` passa a ser:

```ts
{ superadmin: "Overlord", admin: "Administrador", member: "Membro", editor: "Editor", author: "Autor" }
```

`ensureBaseRbacDataSeeded` já é idempotente e já roda em todo grant de papel + no
`scripts/install-fresh.ts`. O `.mjs` some do `package.json` (ou vira um `no-op` com aviso).
Permissions base dos novos papéis entram numa constante irmã de `ADMIN_BASE_PERMISSION_KEYS`
(`contracts/base-role-permissions.ts`):

```ts
export const EDITOR_BASE_PERMISSION_KEYS = [
  "platform.admin.access", "cms.categories.manage", "cms.entries.manage", "cms.entries.publish",
] as const;
export const AUTHOR_BASE_PERMISSION_KEYS = [
  "platform.admin.access", "cms.entries.manage",
] as const;
```

Sem escopo semeado — as linhas de `role_assignment_scopes` são criadas pelo admin ao atribuir o
papel a uma pessoa. Um `editor` recém-criado e sem escopo nenhum = editor **global** (regra D2);
o admin escopa depois. Isso é intencional: mantém o boot 100% aditivo.

---

## 4. Impacto por área

### 4.1 Schema `rbac`

- **+1 tabela** `role_assignment_scopes` (migration `drizzle-kit generate` no core).
- Nada muda em `roles` / `role_permissions` / `user_roles`.
- DoD §5: nº de migrations rastreadas == nº de arquivos em `drizzle/`.

### 4.2 `authorize-actor.ts` + `get-user-context` (hot path)

- `store.ts`: +LEFT JOIN em `role_assignment_scopes` (mesma query, +1 join). Cuidado com
  fan-out de linhas (papel × permission × escopo) — agrupar no `view.ts`, não no SQL.
- `view.ts`: monta `scopedPermissions`. Testes de unidade novos cobrindo: papel global + papel
  escopado do mesmo user, união de ids, superadmin.
- `authorize-actor.ts`: +param opcional, +ramo de resolução de escopo, +`resolveScope`. Os testes
  atuais (`authorize-actor.test.ts`, 7 casos) continuam passando sem alteração.
- `user-context-cache.ts`: sem mudança estrutural.

### 4.3 Loaders de página admin (`src/platform/admin-shell/get-*-page-data.ts`)

- **Fase A/B: nenhuma mudança.** `get-cms-page-data` continua liberando a seção pra quem tem
  qualquer `cms.*.manage` — o editor escopado entra na seção normalmente.
- **Fase C:** `getCmsPageData` passa a anexar no `AdminPageGate.actor` um resumo do escopo do
  ator (ex: `cmsCategoryScope: "global" | string[]`), lido de `scopedPermissions["cms.category"]`,
  pra as páginas não precisarem recomputar. Alternativa: cada página chama `resolveScope`
  diretamente. Decidir na Fase C; recomendo pôr no gate (menos round-trips, mesmo espírito do
  `cache()` já usado).
- **Fase D:** `get-admin-page-data` honra `admin.section` (ver D7).

### 4.4 Telas e handlers do CMS (Fase C)

Leitura:

- `list-entries-for-admin` (`service.ts`): hoje `findAllEntries(query)` sem recorte. Passa a
  receber `allowedCategoryIds?: string[]` — o `handler.ts` chama
  `resolveScope("cms.entries.manage", "cms.category")`; `global` → não filtra; `scoped` → injeta
  os ids (e trata "entry sem categoria" como invisível pro editor escopado); `none` → 403 como
  hoje. O filtro `internalOwner IS NULL` continua.
- `list-categories`: hoje é **público, sem `authorizeActor`** (catálogo do site). **Não mexer no
  handler público.** A tela de admin de categorias passa a usar um caminho administrativo
  (`list-categories-for-admin`, novo, gated + escopado) — o público segue vendo todas.
- Telas de composição/entry (`update-entry-composition`, editores de página) filtram o seletor de
  categoria pelos ids do escopo.

Escrita (todos resolvem o escopo antes de mutar):

> **Nota de implementação (Fase C):** o esboço abaixo previa a checagem no `handler.ts` via
> `authorizeActor(perm, { type: "cms.category", resourceId })`. Na implementação ela ficou no
> `service.ts`, através do helper `assertCmsCategoryScope(actorId, keys, categoryId)`
> (`contexts/cms/shared/scoped-authorization`), porque os testes de integração chamam `service.ts`
> direto (o `next-auth`/`getCurrentUser` é stubado e `authorizeActor` sempre veria
> "unauthenticated"). O `handler.ts` mantém `authorizeActor(perm)` como gate de seção. O efeito de
> autorização é o mesmo; muda a camada.

- `create-entry` → `assertCmsCategoryScope(actorId, ["cms.entries.manage"], input.categoryId ?? null)`.
  Bloqueia criar entry fora do escopo. Entry sem categoria: só quem tem a permission global.
- `update-entry` / `update-entry-composition` / `archive-entry` / `delete-entry` → resolvem a
  categoria **atual** da entry (store lookup, igual `broadcast` resolve o pai por `eventId`) e
  passam no `scope`. Trocar a categoria de uma entry pra fora do próprio escopo = bloqueado.
- `publish-entry` / `schedule-entry` → `authorizeActor("cms.entries.publish", { type: "cms.category", resourceId })`
  (deixa de aceitar `cms.entries.manage` como OR — ver D6). Autor cai aqui.
- `create-category` / `update-category` / `delete-category` → `cms.categories.manage` +
  `scope`. Um editor com `cms.categories.manage` escopada edita metadados só das suas; criar
  categoria nova continua exigindo global (não dá pra escopar algo que ainda não existe).
  **Estado na Fase C:** só `create-category` existe como feature — recebeu
  `assertCmsCategoryScope(actorId, ["cms.categories.manage"], null)` (⇒ só global). `update-category`
  e `delete-category` **não existem** ainda; quando forem criados, entram no mesmo helper
  resolvendo a categoria alvo. (Known Gap.)

Auditoria: os handlers acima já chamam `beginOperation`/`endOperation`; adicionar
`recordAuditEvent` pro caso "negado por escopo" entra no trabalho incremental de auditoria já
listado no `AGENTS.md` §7 (não é bloqueante).

### 4.5 Tela `/admin/rbac`

- `create-custom-role` / `update-role-permissions` / `rename-role` / `list-roles`: **sem
  mudança** — escopo não é atributo do papel.
- **Nova feature** `assign-scope-to-role-assignment` (+ `remove-…`): gated por `rbac.roles.assign`
  (mesma permission de `assign-role-to-user`). Fluxo na UI: ao atribuir `editor`/`author` (ou
  qualquer papel com permission escopável) a um usuário, aparece um **multi-select de categorias**
  (dados via loader de composição em `platform/`, D5). Sem seleção = papel global pra aquele user
  (com aviso visual). Segue a regra do `AGENTS.md` de "sem jargão / sempre picker, nunca UUID
  cru" (memória `feedback_admin_ux_no_dev_jargon`).
- `list-users-by-role` / `count-users-with-permissions`: sem mudança de contrato; podem ganhar
  um badge "escopado" na listagem (cosmético).

### 4.6 Barrels e boundaries

- `src/contexts/rbac/index.ts` exporta: `resolveScope`, os handlers
  `assignScopeToRoleAssignment`/`removeScopeFromRoleAssignment`, `RBAC_SCOPE_TYPES`, e os tipos
  novos. `authorizeActor` mantém o nome.
- Nenhum import novo de `rbac → cms`. A ponte é sempre composição em `platform/`.
- `eslint-plugin-boundaries` não precisa de regra nova.

---

## 5. Migração dos papéis atuais

Tudo **aditivo** — nenhuma revogação, nenhum backfill de escopo.

| Passo | Ação | Efeito |
| --- | --- | --- |
| 1 | Migration cria `role_assignment_scopes` vazia | Ninguém tem escopo → `scopedPermissions` vazio → `authorizeActor` sem 2º arg = comportamento atual |
| 2 | `SYSTEM_ROLE_KEYS` += `editor`, `author`; `ensureBaseRbacDataSeeded` semeia os 2 papéis + alias canônico dos 5 | `editor`/`author` passam a existir, `is_system`, **sem** usuário e **sem** escopo |
| 3 | Self-heal aplica `EDITOR_/AUTHOR_BASE_PERMISSION_KEYS` | Papéis já nascem com o conjunto certo de permissions (globais até serem escopados por atribuição) |
| 4 | `admin` / `member` / `superadmin` | **Intocados.** `admin` segue com todas as permissions globais; aliases atualizados pra "Administrador"/"Membro"/"Overlord" pelo self-heal |
| 5 | Usuários existentes | Mantêm exatamente os papéis e acesso que têm. Quem era `admin` continua `admin` global |

Rollback: `DROP TABLE rbac.role_assignment_scopes` + reverter `SYSTEM_ROLE_KEYS`. Papéis
`editor`/`author` órfãos (se já atribuídos) viram papéis custom comuns — sem perda de acesso
perigosa (eles só concedem permissions de CMS).

`venore-docks.md` — "Modelo de RBAC": atualizar a tabela de papéis (3 → 5), remover o parágrafo
"> Em aberto: permission com escopo…" e trocar por um ponteiro para este documento; tirar o
item de "Ainda não coberto".

---

## 6. Faseamento

As fases são incrementais e cada uma fecha sozinha (lint + typecheck + test verdes, DoD do
`AGENTS.md` §6). **Fase A entrega valor sem nenhuma infra de escopo.**

### Fase A — Nomenclatura de papéis + aliases canônicos  ·  *sem escopo, risco baixo*  ·  ✅ concluída (2026-08-28)

- `SYSTEM_ROLE_KEYS` → 5 keys; `ensure-base-rbac-data.ts` semeia `editor`/`author` +
  `EDITOR_/AUTHOR_BASE_PERMISSION_KEYS` + alias canônico dos 5.
- Aposentar `scripts/seed-role-display-names.mjs`.
- `/admin/rbac` já mostra `roles.name` — validar que os 5 aparecem com o alias certo.
- Atualizar `venore-docks.md` (tabela de papéis) + apontar pra este doc.
- **Entregável:** as 5 personas nomeadas (Overlord/Administrador/Editor/Autor/Membro) existem e
  são atribuíveis. `editor`/`author` ainda são **globais** no CMS (sem recorte) — já útil para
  "coordenação editorial" sem multi-tenancy de categoria.
- Testes: `ensure-base-rbac-data.test.ts` cobre os 5 papéis + as listas de permission.

### Fase B — Infra de escopo dormente  ·  *hot path, risco baixo/médio*  ·  ✅ concluída (2026-08-28)

- Migration `role_assignment_scopes`.
- `get-user-context` (store+view+types) → `scopedPermissions`. `contracts/scope-types.ts`.
- `authorizeActor(perm, scope?)` + `resolveScope(...)` + `rbac/index.ts` exporta.
- `assign-scope-to-role-assignment` / `remove-…` (handler/service/store/types) — gated
  `rbac.roles.assign`, invalidam cache.
- **Nenhum call site passa `scope` ainda** → comportamento do sistema idêntico.
- Testes: unidade de `view.ts` (união global+escopado), `authorize-actor` com escopo (novos
  casos, os 7 atuais intactos), `resolveScope`.

### Fase C — Escopo por categoria no CMS  ·  *muitos services, risco médio*  ·  ✅ concluída (2026-08-28)

- `resolveScopeForActor(actorId, permKey, scopeType)` — irmão de `resolveScope` que recebe o id
  explícito (o `resolveScope` passou a delegar nele). Exportado pelo barrel.
- `get-rbac-scope-options.ts` em `platform/admin-shell/` — compõe `listCategories()` (barrel
  `@/contexts/cms`) + `RBAC_SCOPE_TYPES` pro multi-select da tela de atribuição (`rbac` não
  importa `cms` — D5).
- `getCmsPageData` anexa `cmsCategoryScope: "global" | string[]` no `actor` do gate.
- `list-entries-for-admin` (handler resolve o escopo e injeta `allowedCategoryIds`) +
  `list-categories-for-admin` (novo use case gated) filtram por escopo. `list-categories` público
  **intacto**.
- **Enforcement de escrita no `service.ts`** (não no `handler.ts`): helper
  `contexts/cms/shared/scoped-authorization` (`assertCmsCategoryScope(actorId, keys, categoryId)`),
  chamado por `create/update/update-composition/archive/delete-entry`, `publish/schedule-entry` e
  `create-category`. Motivo: todo teste de integração bypassa o handler (next-auth stubado), então
  o ponto que recebe `actorId` direto é o único exercitável. O handler segue com
  `authorizeActor(perm)` como gate de seção.
- `publish-entry`/`schedule-entry` passam a exigir `cms.entries.publish` e **deixam de aceitar
  `cms.entries.manage`** como atalho (D6). `update-category`/`delete-category` não existem como
  features hoje — só `create-category` (que exige global) foi tratado; ver Known Gaps.
- UI em `/admin/rbac`: multi-select de categorias por nome no fluxo de atribuir papel + editor de
  escopo por pessoa já atribuída (`assign-role-form.tsx`, `role-assignment-scope-editor.tsx`,
  `category-scope-picker.tsx`); `listScopesForRoleAssignment` (novo, gated `rbac.roles.assign`)
  alimenta o estado atual.
- Telas admin de categoria/entry trocaram `listCategories()` → `listCategoriesForAdmin()`.
- Testes: `scoped-cms.integration.test.ts` (cruza `rbac` + `cms`) — editor escopado não
  lista/edita/publica fora da categoria, autor escopado não publica, admin global inalterado,
  mover entry pra fora do escopo falha; unitários de cada service afetado + do helper.
- **Entregável:** o modelo do `issues.md` de fato — Editor de setor, Autor sem publish.

### Fase D — Administrador de seção  ·  *depende de "seção" existir, risco médio*

- `scopeType: "admin.section"`; `admin-navigation-registry` taggeado por seção; loaders
  `get-*-page-data` honram o escopo; `authorizeActor("platform.admin.access", {type:"admin.section",...})`.
- Provavelmente depois do rename CMS→Editorial (roadmap Fase 3).

**Checklist de revisão recorrente (a partir da Fase C):** todo `service.ts` de escrita que opera
sobre uma instância de recurso escopável **resolve o escopo** — via `assertCmsCategoryScope(...)`
(CMS) ou `resolveScopeForActor(actorId, …)` direto. Um `service.ts` de escrita do CMS que carrega
`existing.categoryId` mas não passa por `assertCmsCategoryScope` é achado de review. (A Fase B
previa isso no `handler.ts` via `authorizeActor(perm, scope)`; a Fase C moveu pro `service.ts`
para caber nos testes de integração, que não passam pelo handler — ver §4.4.)

---

## 7. Decisões que preciso confirmar com você

1. **Vínculo do escopo: (usuário × papel)** [recomendado — D1] vs. escopo no próprio papel
   ("Editor de Novidades" já carrega a categoria)?
2. **`editor`/`author` como `is_system`** (muda o invariante "3 papéis" do `venore-docks`) [D8,
   recomendado] vs. papéis custom pré-semeados (mais barato, sem auto-cura)?
3. **Regra de estreitamento: "presença de linha de escopo estreita"** [recomendado — D2] vs.
   chave de permission estreita explícita à la `broadcast` (`cms.entries.manage` +
   `cms.entries.manage.scoped`)?
4. **Alcance inicial do escopo = só `cms.category`** [recomendado], com Academy (cursos) e
   `admin.section` em fases seguintes? Ou já entra `academy.course` junto na Fase C?
5. **`publish-entry` deixar de aceitar `cms.entries.manage`** como atalho pra publicar (D6) — ok?
   Isso muda o comportamento atual pra quem tem só `cms.entries.manage` global e **não** tem
   `cms.entries.publish` (hoje raríssimo: `admin` tem as duas, `superadmin` ignora).
6. **`roles.description`** (coluna nova) pra texto de ajuda na UI de `/admin/rbac`, ou fora de
   escopo?

---

## Apêndice — prompts para as sessões de implementação

Um prompt por fase. Cada sessão é independente e fecha com a Definition of Done do `AGENTS.md`
§6 (fluxo de camadas + `OperationResult`, `npm run lint`, `npm run typecheck`, `npm run test`
verdes; migration via `drizzle-kit generate` quando toca schema, com contagem batendo). Rodar as
fases **na ordem** — B depende de A, C depende de B.

### Prompt — Fase A (nomenclatura de papéis + aliases canônicos)

```
Implementar a Fase A de docs/rbac-scoped-roles.md (§6). Ler antes: esse doc inteiro (decisões
D8 e D9 em especial), AGENTS.md §1 e §6, docs/venore-docks.md "Modelo de RBAC".

Escopo desta sessão — SÓ isto, nada de escopo/tabela nova/authorize-actor (isso é Fase B):

1. src/contexts/rbac/contracts/roles.ts — SYSTEM_ROLE_KEYS passa de
   ["superadmin","admin","member"] para ["superadmin","admin","member","editor","author"].
2. src/contexts/rbac/contracts/base-role-permissions.ts — adicionar, ao lado de
   ADMIN_BASE_PERMISSION_KEYS:
     EDITOR_BASE_PERMISSION_KEYS = ["platform.admin.access","cms.categories.manage",
       "cms.entries.manage","cms.entries.publish"]
     AUTHOR_BASE_PERMISSION_KEYS = ["platform.admin.access","cms.entries.manage"]
   (todas as keys já existem em contracts/permissions.ts — conferir).
3. src/contexts/rbac/ensure-base-rbac-data.ts — SYSTEM_ROLE_NAMES vira os aliases canônicos:
   superadmin "Overlord", admin "Administrador", member "Membro", editor "Editor", author "Autor".
   O seed de roles já itera SYSTEM_ROLE_KEYS (pega editor/author de graça). Estender o bloco de
   role_permissions: hoje só semeia o papel "admin" com ADMIN_BASE_PERMISSION_KEYS; adicionar o
   mesmo tratamento idempotente (onConflictDoNothing) para "editor" e "author" com as listas
   novas. Manter tudo dentro da mesma transação.
4. Aposentar scripts/seed-role-display-names.mjs: remover a linha "db:seed:role-display-names"
   de package.json (linha ~30) e apagar o .mjs. O self-heal agora é a fonte da verdade dos
   aliases (o alias antes vinha desse script one-off; ver D9).
5. docs/venore-docks.md — "Modelo de RBAC": trocar a tabela de 3 papéis pela de 5 (usar a tabela
   da §1 deste doc), remover o parágrafo "> Em aberto: permission com escopo dentro de um
   recurso …" e pôr no lugar um ponteiro para docs/rbac-scoped-roles.md; remover o bullet
   correspondente de "Ainda não coberto neste documento".
6. Atualizar o Status no topo de docs/rbac-scoped-roles.md marcando Fase A como concluída.

Testes: src/contexts/rbac/ensure-base-rbac-data.test.ts passa a cobrir os 5 papéis de sistema e
as três listas de permission base (admin/editor/author). Verificar que create-custom-role,
rename-role, update-role-permissions e os testes de authorize-actor seguem verdes sem alteração.

NÃO fazer nesta sessão: role_assignment_scopes, scopedPermissions, mudança em authorize-actor,
mudança em get-user-context, qualquer coisa de CMS. editor/author saem daqui GLOBAIS no CMS
(sem recorte) — é o esperado; o recorte é a Fase C.
```

### Prompt — Fase B (infra de escopo dormente)

```
Implementar a Fase B de docs/rbac-scoped-roles.md (§6). Pré-requisito: Fase A já mergeada. Ler
antes: o doc inteiro (decisões D1, D2, D3, D4, D5), AGENTS.md §1/§5/§6, e o precedente
src/plugins/broadcast/shared/scoped-authorization/{index,store}.ts.

Regra de ouro desta fase: NENHUM call site passa `scope` ainda. Ao final, o comportamento do
sistema tem que ser idêntico ao de antes — a infra existe mas está dormente. Os 7 casos de
src/contexts/rbac/authorize-actor.test.ts passam sem edição.

1. Schema — src/contexts/rbac/database/schema/index.ts: tabela role_assignment_scopes
   (userId → auth.users, roleId → rbac.roles, scopeType text, resourceId text, assignedAt).
   PK (userId, roleId, scopeType, resourceId). FK composta (userId, roleId) →
   user_roles(userId, roleId) ON DELETE CASCADE. Sem FK em resourceId (cross-schema — mesma
   decisão de entries.mediaId). Rodar `npm run db:generate`, conferir contagem em drizzle/.

2. src/contexts/rbac/contracts/scope-types.ts (novo) — RBAC_SCOPE_TYPES: por enquanto só
   { type: "cms.category", label: "Categoria do CMS",
     scopablePermissionKeys: ["cms.categories.manage","cms.entries.manage","cms.entries.publish"] }.
   Exportar tipo do `type` (union de string literais).

3. get-user-context:
   - store.ts: +LEFT JOIN em role_assignment_scopes por user_id. CUIDADO com fan-out
     (papel × permission × escopo) — trazer as linhas de escopo agrupáveis por roleId, não
     multiplicar no SQL. Pode ser uma segunda query separada por user_id se ficar mais limpo.
   - view.ts (toUserRbacContext): montar scopedPermissions:
       Record<permissionKey, Record<scopeType, "global" | string[]>>
     Regra D2: por papel que concede a permission, se aquele (userId, roleId) tem linha(s) de
     escopo do tipo T → contribui com esses ids; senão → contribui "global". União: se algum
     papel deu "global", o valor final de [permKey][T] é "global"; senão é a união dos ids.
     Só entram no map as keys que ao menos um papel concede.
   - contracts/types.ts: UserRbacContext ganha `scopedPermissions`. `permissions: string[]`
     PERMANECE (união de keys, global ou escopada) — não quebrar os ~15 `.includes()`.
   - user-context-cache.ts: sem mudança estrutural (só cacheia o objeto maior).

4. authorize-actor.ts:
   - Assinatura: authorizeActor(requiredPermission, scope?: { type: string; resourceId: string }).
     Sem `scope` → caminho atual bit a bit. Retorno inalterado.
   - Com `scope` → superadmin passa; senão, para cada key pedida, resolver
     scopedPermissions[key][scope.type]: "global" passa; array → passa se resourceId ∈ array;
     ausente → nega. Erro novo code "rbac.authorization.forbidden_scope".
   - Novo export `resolveScope(permissionKey: string, scopeType: string)`:
       { kind: "global" } | { kind: "scoped"; resourceIds: string[] } | { kind: "none" }
     lê getUserContext do ator corrente (mesmo getCurrentUser de authorizeActor).

5. Features novas em src/contexts/rbac/features/role-assignment/:
   - assign-scope-to-role-assignment/ (handler/service/store/types) — gated
     authorizeActor("rbac.roles.assign"). Valida: o (userId, roleId) existe em user_roles; o
     scopeType é de RBAC_SCOPE_TYPES. Insere idempotente. Chama invalidateUserContext(userId).
   - remove-scope-from-role-assignment/ — simétrico.
   - OperationResult em handler e service.

6. Barrel src/contexts/rbac/index.ts: exportar resolveScope, os dois handlers novos (com nota
   se precisarem de ponto de composição), RBAC_SCOPE_TYPES e os tipos novos.

7. docs/rbac-scoped-roles.md — marcar Fase B concluída no Status.

Testes:
- view.ts: user com papel global + papel escopado do mesmo tipo → união correta; superadmin;
  papel escopado sozinho.
- authorize-actor: novos casos com `scope` (global passa / id na lista passa / id fora nega /
  sem a permission nega / superadmin ignora). Os 7 casos atuais INTACTOS.
- resolveScope: os três kinds.
- assign/remove-scope: handler (autorização + validação de borda) e service.

NÃO fazer: nenhuma mudança em src/contexts/cms, src/platform/admin-shell, ou nos handlers de
escrita existentes. Nenhum call site de authorizeActor ganha 2º argumento nesta fase.
```

### Prompt — Fase C (escopo por categoria no CMS)

```
Implementar a Fase C de docs/rbac-scoped-roles.md (§6 + §4.4). Pré-requisito: Fases A e B
mergeadas. Ler antes: o doc inteiro (D2, D3, D5, D6, §4.3, §4.4), AGENTS.md §1/§2/§6,
docs/venore-docks.md regra 10 (composição entre contexts) e regra 13 (gate de página).

Objetivo: editor/author passam a enxergar e agir SÓ nas categorias do CMS atribuídas à sua
atribuição de papel. Admin global e superadmin: comportamento inalterado.

1. Composição em src/platform/ para a UI de atribuição de escopo:
   loader que devolve as categorias (listCategories() do barrel @/contexts/cms) + papéis
   (listRoles() do barrel @/contexts/rbac) para o multi-select da tela de atribuição de papel.
   rbac NÃO importa cms — a ponte é aqui (regra 10). UI: ao atribuir editor/author (ou qualquer
   papel com permission de RBAC_SCOPE_TYPES.scopablePermissionKeys) a um usuário, mostrar
   multi-select de categorias; sem seleção = papel global pra aquele user, com aviso visual.
   Sem jargão, sem UUID cru (memória feedback_admin_ux_no_dev_jargon) — picker de categoria por
   nome. Chama assign-scope-to-role-assignment / remove-scope-from-role-assignment (Fase B).

2. src/platform/admin-shell/get-cms-page-data.ts — anexar no AdminPageGate.actor um resumo
   cmsCategoryScope: "global" | string[], lido de scopedPermissions["cms.category"]
   (via resolveScope ou direto do context). A liberação da SEÇÃO continua como está (qualquer
   cms.*.manage entra) — o recorte é dentro das telas.

3. Leitura:
   - src/contexts/cms/features/entries/list-entries-for-admin/ — service ganha
     allowedCategoryIds?: string[]. handler chama resolveScope("cms.entries.manage",
     "cms.category"): global → não filtra; scoped → injeta ids (e entry sem categoria fica
     invisível pro editor escopado); none → 403 como hoje. Manter o filtro internalOwner IS NULL.
   - list-categories/handler.ts é PÚBLICO (sem authorizeActor) — NÃO mexer. Criar
     list-categories-for-admin/ (novo use case, gated cms.categories.manage OU cms.entries.manage,
     escopado) para a tela de admin de categorias.
   - Seletor de categoria nas telas de edição/composição (update-entry-composition e afins)
     filtrado pelos ids do escopo.

4. Escrita — todos passam a mandar scope { type: "cms.category", resourceId }:
   - create-entry: authorizeActor("cms.entries.manage", { type:"cms.category",
     resourceId: input.categoryId }). Entry sem categoria → só permission global.
   - update-entry, update-entry-composition, archive-entry, delete-entry: resolver a categoria
     ATUAL da entry no store (padrão de findAgendaIdByEventId do broadcast) e passar no scope.
     Trocar categoria de uma entry para fora do próprio escopo = bloqueado.
   - create-category / update-category / delete-category: cms.categories.manage + scope.
     Criar categoria nova continua exigindo global (não dá pra escopar o que não existe).
   - publish-entry / schedule-entry: passam a exigir authorizeActor("cms.entries.publish",
     { type:"cms.category", resourceId }) e DEIXAM de aceitar cms.entries.manage como OR
     (decisão D6 — confirmada). Author cai aqui e não publica. admin tem cms.entries.publish
     global; superadmin ignora. Ajustar os testes de publish-entry/schedule-entry.

5. docs/rbac-scoped-roles.md — marcar Fase C concluída.

Testes de INTEGRAÇÃO (cruza rbac + cms — npm run test:integration com TEST_DATABASE_URL):
editor escopado não lista/edita/publica fora da categoria atribuída; author escopado cria
rascunho mas não publica; admin global inalterado; trocar categoria de entry pra fora do escopo
falha. Unitários dos services afetados.

Checklist de review daqui pra frente: handler.ts de escrita do CMS sobre instância de recurso
SEM 2º argumento em authorizeActor é achado de review.

NÃO fazer: escopo admin.section (Fase D), academy.course, rename CMS→Editorial.
```

### Prompt — Fase D (administrador de seção)

```
Implementar a Fase D de docs/rbac-scoped-roles.md (§6 + D7). Pré-requisito: Fases A–C mergeadas;
idealmente depois do rename CMS→Editorial (roadmap Fase 3). Ler antes: o doc inteiro (D7),
docs/implementation-roadmap.md, src/platform/admin-shell/admin-navigation-registry.ts e os
get-*-page-data.ts.

Antes de codar: reabrir com o dono a modelagem de "seção" — a direção do doc é
scopeType "admin.section" com resourceId ∈ {"cms","academy","media",...} (as áreas do
admin-navigation-registry), mas confirmar a lista de seções e se "Administrador do Academy" é
uma seção ou um papel custom com permissions do plugin academy.

Direção proposta (validar antes de executar):
1. contracts/scope-types.ts — adicionar { type:"admin.section", label:"Seção administrativa",
   scopablePermissionKeys:["platform.admin.access", ...as permissions de cada seção] }.
2. admin-navigation-registry — cada grupo/item passa a declarar a que seção pertence.
3. get-admin-page-data.ts / get-*-page-data.ts — honrar scopedPermissions["admin.section"]:
   ator com escopo de seção só vê/entra nas seções atribuídas.
4. authorizeActor("platform.admin.access", { type:"admin.section", resourceId }) nos pontos
   de gate de seção.
5. UI de atribuição (a mesma da Fase C) ganha o multi-select de seções para papéis com
   platform.admin.access.
6. docs/rbac-scoped-roles.md — marcar Fase D concluída; fechar o gap correspondente em
   venore-docks.md.

Testes de integração: admin de seção "cms" não acessa /admin/academy; admin global inalterado.
```
