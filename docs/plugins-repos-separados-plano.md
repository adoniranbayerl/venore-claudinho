# Plano — plugins em repositórios separados (opção 3)

Objetivo: tirar `src/plugins/<key>/**` do monorepo do core. Cada plugin vira um repo próprio; uma
instância traz **só os plugins que quer**; `git pull` no core não arrasta plugin nenhum, e
atualização de core é O(1) por instância (sem branch de deploy, sem merge recorrente).

Custo resumido: **2–4 semanas** de trabalho focado. Fases 0–2 são o grosso (definir o SDK,
migrar os imports dos 6 plugins, tirar o hard-code de plugin do `platform/`, codegen dos
registries). Fases 3–4 são mecânicas (~0.5–1 dia/plugin). Depois: um contrato versionado a manter
(SDK), N+1 repos pra lançar, e setup de dev com `npm link`/workspace.

Regra durante todo o plano: **o monorepo continua shippável em cada fase** (strangler-fig). Nada
quebra o build do core até o caminho novo estar provado.

---

## Decisões de arquitetura

### Mecanismo de distribuição — **script de sync** (recomendado), npm como evolução

- **Sync-script (recomendado agora):** o deploy define `VENORE_PLUGINS=broadcast,academy` (env) ou
  um `venore.plugins.json`. `scripts/sync-plugins.ts` faz `git clone`/`fetch` de cada
  `venore-plugin-<key>` num ref compatível pra `src/plugins/<key>/` (que passa a ser **gitignored**),
  e roda o codegen. `git pull` no core + `npm run sync-plugins` no deploy. **Sem registry, sem
  publish.** Estado por-instância = só a env var, zero arquivo rastreado → nunca dá conflito de merge.
- **npm packages (evolução):** cada plugin publicado como `@venore/plugin-<key>` num registry
  privado (GitHub Packages / npm org / Verdaccio). `npm ci` traz só o que está em `dependencies`.
  Mais "correto" e versionado, mas exige infra de registry + CI de publish. Migrar do sync-script
  pra isto depois é incremental (o codegen passa a varrer `node_modules/@venore/plugin-*` em vez de
  pastas).

### O contrato core → plugin — pacote **`@venore/plugin-sdk`**

Hoje plugin importa `@/contexts/*` (barrels), `@/platform/*` (helpers), `@/shared/*` (tipos),
`@/infrastructure/database/client` (`db`), `@/observability`, o schema de manifesto, os tipos de
route-table (`PluginRouteTable`, `asPluginPage`, `asPluginApiHandler`), `isPluginActive`, etc.

`@venore/plugin-sdk` = **exatamente essa superfície**, re-exportada e versionada (semver). É o
artefato mais importante do plano — é o contrato. Tudo o mais no core vira privado. A superfície
inicial sai do que o `AGENTS.md` já diz que plugin pode usar (barrel + `contracts/` + um punhado de
helpers de `platform/` + `db`/`observability`/`OperationResult`/`authorizeActor`/`beginOperation`).

Mora **dentro do repo do core** como workspace; publicado (ou consumido pelo sync-script) a partir
da Fase 3.

### `@venore/eslint-config`

As regras de `boundaries/dependencies` do `eslint.config.mjs` (plugin→plugin, plugin→context-internal)
viram um pacote compartilhado que o core e cada repo de plugin estendem. As fixtures
`src/plugins/_fixture-cross-*` viram teste desse pacote.

### Registries gerados + modelo de contribuição

Hoje `platform/` hard-coda cada plugin: `notification-registry.ts` faz `import ... from
"@/plugins/academy"`, idem `user-nav/registry.ts`, block-registry, e `registry.ts`/`route-registry.ts`
importam cada manifesto por caminho fixo.

Vira:
- O **manifesto** (ou um export `plugin.contributions`) declara o que o plugin contribui:
  notification-alert resolver, item de user-nav, blocos, etc.
- `platform/` **itera `PLUGIN_REGISTRY`** usando essas contribuições — nunca importa `@/plugins/<x>`.
- `scripts/gen-plugin-registry.ts` (roda em `predev`/`prebuild`) varre os plugins presentes, lê cada
  manifesto e **gera** `src/plugins/registry.generated.ts` + `route-registry.generated.ts`.

### Migrations

Já são desacopladas (schema próprio, tracking próprio, drizzle.config próprio). Mudanças:
- `db:migrate:<plugin>` no `package.json` → um `db:migrate:plugins` que itera os plugins presentes.
- `run-plugin-migrations.ts` (já lê `PLUGIN_REGISTRY` + `manifest.migrationsPath`) → resolver o path
  a partir da raiz do pacote/pasta do plugin.
- `install-fresh.ts` → enumeração dinâmica.
- Nova migration neutralizando o `INSERT` hard-coded da `0034_backfill_extension_install_state.sql`
  (num core sem os pacotes de plugin, essas linhas ficam órfãs; melhor torná-las inertes de vez).

### Testes

- `*.test.ts` de plugin vão pro repo do plugin, rodam no CI dele contra `@venore/plugin-sdk`
  (mín. suportado + latest).
- Core mantém os testes dele, larga os de plugin.
- **Novo: suíte de integração/conformance** (`venore-integration`): matriz core × conjunto de
  plugins; sobe o app, roda as migrations de cada plugin contra um Postgres real, bate nas rotas de
  smoke. É o que substitui o "um `npm test` cobre tudo".

### Dev local

- Mexer num plugin: `npm link` / dependência `file:` / overlay de workspace. Helper
  `scripts/link-plugin.ts <path>`.
- Mexer em core + plugin juntos: workspace apontando pros checkouts locais.

---

## Fases

| Fase | O quê | Depende de |
|---|---|---|
| 0 | Decisões + esqueleto: `@venore/plugin-sdk` e `@venore/eslint-config` como workspaces no core | — |
| 1 | Codegen dos registries + modelo de contribuição no manifesto; `platform/` fica plugin-agnóstico | 0 |
| 2 | Import audit: os 6 plugins passam a importar SÓ do SDK (ainda no monorepo); congela SDK 1.0.0 | 0, 1 |
| 3 | Extrai o **broadcast** pra repo próprio; `sync-plugins.ts`; prova o modelo ponta a ponta | 1, 2 |
| 4 | Extrai os demais (academy, helpdesk, company-metrics, birthdays, donations) — 1 sessão/plugin | 3 |
| 5 | Suíte de integração/conformance + CI multi-repo | 3 |
| 6 | Runbook de deploy + limpeza + neutralizar a `0034` + atualizar AGENTS.md/venore-docks | 4, 5 |

---

## Prompts de sessão

### Fase 0 — Decisões + esqueleto do SDK

```
Contexto: monorepo Venore (Next.js). Vamos tirar src/plugins/<key>/** pra repos separados (plano em
docs/plugins-repos-separados-plano.md). Esta fase NÃO extrai nada — só cria o contrato.

Tarefa:
- Decidir e registrar no doc: mecanismo de distribuição (sync-script recomendado), scope do SDK
  (@venore/plugin-sdk), onde vive a suíte de integração.
- Criar o pacote workspace @venore/plugin-sdk DENTRO do repo do core (packages/plugin-sdk/ +
  entrada em npm workspaces / tsconfig paths). Ele RE-EXPORTA a superfície que plugin pode usar:
  * barrels de context: @/contexts/{cms,rbac,media,settings,auth,themes} e seus contracts/
  * helpers de platform que plugin usa hoje (levantar via grep nos imports dos 6 plugins):
    isPluginActive, os tipos de plugin-routing (PluginRouteTable, asPluginPage, asPluginApiHandler),
    PluginManifest / manifest-schema, brand (getBrandConfig), etc.
  * infra: db (@/infrastructure/database/client), @/observability (beginOperation/endOperation),
    @/shared/types (OperationResult), authorizeActor/AuthorizeActorResult (@/contexts/rbac).
- Criar @venore/eslint-config (packages/eslint-config/) com as regras boundaries/dependencies de
  plugin que hoje vivem em eslint.config.mjs.
- Provar: apontar UM plugin ainda in-tree (broadcast) pra importar só via @venore/plugin-sdk num
  arquivo piloto; typecheck passa.

Definition of Done: os dois pacotes existem como workspaces; `npm run typecheck` verde; o doc
registra as decisões e a lista COMPLETA de imports `@/...` que os 6 plugins fazem hoje (é o mapa da
Fase 2).
```

### Fase 1 — Codegen dos registries + contribuições no manifesto

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 1. Ainda monorepo, todos os plugins
in-tree. Objetivo: NENHUM arquivo de platform/ pode importar @/plugins/<x> por caminho fixo.

Tarefa:
- Estender manifest-schema (PluginManifest): campo `contributions` cobrindo o que hoje é hard-coded
  por plugin em platform/ — notification-alert resolver (platform/notifications/notification-registry.ts),
  item de user-nav (platform/user-nav/registry.ts), blocos (se aplicável), e o que mais um grep por
  `@/plugins/` dentro de src/platform e src/app revelar.
- Refatorar esses registries pra ITERAR PLUGIN_REGISTRY lendo `manifest.contributions` — em vez de
  `import { getMessageNavLink } from "@/plugins/academy"`, o manifesto do academy declara o
  provider e a plataforma chama pelo registro.
- scripts/gen-plugin-registry.ts: varre src/plugins/*/manifest.* (modelo sync-script) ou
  node_modules/@venore/plugin-* (modelo npm), gera src/plugins/registry.generated.ts +
  route-registry.generated.ts. Wire em `predev` e `prebuild`. registry.ts/route-registry.ts atuais
  viram re-export do generated (ou são substituídos).
- Provar plugin-agnosticismo: remover TEMPORARIAMENTE uma pasta de plugin local -> `npm run build`
  passa, aquele plugin só fica ausente (nada em platform/ quebra).

Definition of Done: `grep -rn "@/plugins/" src/platform src/app` não retorna import de plugin
específico (só os 3 dispatchers genéricos [plugin]); lint/typecheck/test verdes; build passa com
uma pasta de plugin removida.
```

### Fase 2 — Import audit: os 6 plugins importam só o SDK

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 2. Ainda monorepo. Um plugin por vez,
nesta ordem: broadcast, academy, helpdesk, company-metrics, birthdays, donations.

Para cada plugin:
- Trocar todo `import ... from "@/..."` por `import ... from "@venore/plugin-sdk"` (ou subpath do
  SDK). Import relativo DENTRO do próprio plugin continua.
- Cada import que o SDK não expõe: decidir — (a) é superfície pública legítima -> adicionar ao SDK;
  (b) o plugin está alcançando um internal -> refatorar o plugin pra não precisar. Registrar cada
  decisão no doc.
- Rodar os testes daquele plugin + typecheck + lint.

No fim da fase:
- Congelar a superfície do @venore/plugin-sdk e marcar 1.0.0.
- `grep -rn "from \"@/" src/plugins` só retorna imports relativos (`./`, `../`) — zero `@/contexts`,
  `@/platform`, `@/infrastructure`, `@/shared` nos plugins.

Definition of Done: os 6 plugins compilam e passam nos testes importando só do SDK, ainda no
monorepo (um CI só valida tudo); SDK 1.0.0 congelado e documentado.
```

### Fase 3 — Extrair o broadcast + sync-plugins (prova do modelo)

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 3. SDK 1.0.0 pronto, platform
plugin-agnóstico. Agora o primeiro plugin sai do monorepo.

Tarefa:
- git filter-repo (ou subtree split) de src/plugins/broadcast + docs/broadcast-* + testes ->
  novo repo venore-plugin-broadcast, preservando histórico.
- No repo novo: package.json (dep @venore/plugin-sdk ^1, @venore/eslint-config), tsconfig, eslint,
  drizzle.config.ts (migrationsPath relativo à raiz do pacote), CI (typecheck + lint + test +
  db:migrate contra PG efêmero). manifest.compatibility.coreVersion alinhado ao SDK.
- Publicar @venore/plugin-sdk + @venore/eslint-config (registry privado) OU deixá-los consumíveis
  pelo sync-script (tarball/git ref).
- No core: scripts/sync-plugins.ts — lê VENORE_PLUGINS (env) ou venore.plugins.json, faz fetch de
  cada venore-plugin-<key> no ref compatível pra src/plugins/<key>/ (gitignored), roda
  gen-plugin-registry. Script db:migrate:plugins que itera os plugins sincronizados.
- No core: git rm -r src/plugins/broadcast; adicionar src/plugins/* ao .gitignore (menos um
  .gitkeep); CI do core roda sync-plugins com um conjunto pinado antes dos testes.
- Provar ponta a ponta: num checkout limpo do core, `VENORE_PLUGINS=broadcast npm run sync-plugins
  && npm run build` -> só o broadcast presente e ativo; `git pull` no core não traz plugin.

Definition of Done: venore-plugin-broadcast é um repo com CI verde; core sem a pasta broadcast;
deploy com VENORE_PLUGINS=broadcast funciona (rotas, migrations, view de saída); doc atualizado com
o runbook.
```

### Fase 4 — Extrair os demais plugins

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 4. Modelo provado com o broadcast.
Repetir a receita da Fase 3 para UM plugin (informar qual): academy | helpdesk | company-metrics |
birthdays | donations.

Tarefa (idêntica à Fase 3, trocando o nome):
- git filter-repo -> venore-plugin-<key> com histórico.
- package.json / tsconfig / eslint / drizzle.config / CI próprios; dep @venore/plugin-sdk ^1.
- git rm no core; conjunto pinado do CI do core atualizado.
- Provar: deploy com VENORE_PLUGINS incluindo esse plugin traz e ativa; sem ele, ausente e inerte.
- Casos especiais: donations não tem schema (sem db:migrate); academy tem bundle de curso
  (docs/cursos) — mover junto; helpdesk/company-metrics têm mais superfície de admin — conferir
  que todas as contribuições estão no manifesto (Fase 1).

Definition of Done: o plugin é um repo com CI verde; core sem a pasta dele; um deploy de teste
seleciona-o via VENORE_PLUGINS e funciona.
```

### Fase 5 — Suíte de integração + CI multi-repo

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 5. Plugins extraídos. Precisa do
equivalente ao "um npm test cobre tudo".

Tarefa:
- Repo/job venore-integration: matriz (core ref) x (conjunto de plugins + versões). Para cada
  combinação: sync-plugins, npm ci, sobe o app (next start), roda db:migrate core + db:migrate:plugins
  contra um Postgres real, bate nas rotas de smoke de cada plugin (health + 1-2 rotas chave).
- CI de cada repo de plugin: testar contra @venore/plugin-sdk mín. suportado E latest.
- CI do core: qualquer mudança na superfície de packages/plugin-sdk dispara o job de integração
  (e é uma decisão de semver — documentar o processo).
- Documentar a política de versão do SDK (o que é major/minor/patch) no doc e no README do pacote.

Definition of Done: o job de integração roda e passa para o conjunto atual de plugins; um PR que
quebra a superfície do SDK falha no job de integração (provar com um PR de teste).
```

### Fase 6 — Runbook de deploy + limpeza

```
Contexto: plano docs/plugins-repos-separados-plano.md, Fase 6. Última fase.

Tarefa:
- docs/: runbook por instância — VENORE_PLUGINS, `git pull` core, `npm run sync-plugins`,
  `npm run db:migrate` (core) + `npm run db:migrate:plugins`. Um exemplo pro servidor LAN do
  broadcast (VENORE_PLUGINS=broadcast) e um pra uma instância cloud multi-plugin.
- Nova migration de core: neutralizar o INSERT hard-coded de plugins da
  0034_backfill_extension_install_state.sql — num core sem os pacotes, essas linhas de
  extensions.extension_state ficam órfãs e enganam o registry; torná-las inertes (ou deletar as que
  não têm updated_by_user_id e cujo plugin não está presente).
- install-fresh.ts: enumeração dinâmica de plugins; deixar de assumir o conjunto fixo.
- Limpar: db:migrate:<plugin> mortos do package.json, fixtures _fixture-cross-* migradas pro
  eslint-config, regras de boundary de plugin removidas do eslint.config.mjs do core.
- Atualizar AGENTS.md e docs/venore-docks.md: a seção "Sistema de plugins" passa a descrever repos
  separados + SDK + sync-plugins, não mais "import estático em registry.ts".

Definition of Done: lint/typecheck/test do core verdes; um `db:install:fresh` num banco vazio +
VENORE_PLUGINS=broadcast leva a um app funcional só com broadcast; AGENTS.md/venore-docks refletem
o modelo novo.
```

---

## Comparação final com a opção 2

| | Opção 2 (branches de deploy) | Opção 3 (este plano) |
|---|---|---|
| Atualizar core em N instâncias | `git merge main` por branch, conflito recorrente no `registry.ts` (+ delete/modify das pastas apagadas). Manual, N vezes por release. | `git pull` no core + `npm run sync-plugins`. Sem merge, sem conflito. O(1) por instância. |
| Estado por-instância | Um branch long-lived por instância, com um "trim commit" a manter. | Uma env var (`VENORE_PLUGINS`). Zero arquivo rastreado. |
| Código morto no bundle | Sim, a menos que apague pastas (e aí paga conflito). | Não — só o que foi sincronizado está no disco. |
| Custo de setup | ~0 de código; disciplina de branch pra sempre. | 2–4 semanas (SDK + audit + codegen + extração). |
| Custo recorrente | Imposto de merge ilimitado e manual, cresce com (branches × releases). | Contrato SDK versionado + job de integração + N+1 releases. Bounded e centralizável. |
| Quando escolher | ≤ 3–4 instâncias, releases espaçados. | Muitas instâncias / releases frequentes / muitas combinações de plugin. |
