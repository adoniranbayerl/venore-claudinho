# Port do módulo Birthdays (fem-colaborador) para o plugin-engine (venore-claudinho)

Fase 1 — tradução de contrato. Não há implementação neste documento; é a base para decidir o que
implementar na Fase 2.

Fonte lida por inteiro: `../fem-colaborador/src/modules/birthdays` (README, `module.json`,
`manifest.ts`, `setup.ts`, `contracts.ts`, `database/`, `queries/`, `services/`, `actions/`,
`views/`, `views-registry.ts`, `seeds/`, `locales/`, `appearance.ts`/`appearance.server.ts`, os
dois arquivos de teste) + pontos de core que o módulo toca (`core/rbac/contracts/shared.ts`,
`core/rbac/permission-catalog.ts`, `core/modules/*`, migration `0001_mushy_skin.sql`).

Alvo lido: `src/platform/plugin-engine/*`, `src/plugins/registry.ts`, `src/plugins/academy/*`
(único plugin real hoje, tratado como referência de padrão), `docs/venore-docks.md` (seção
"Sistema de plugins" e regras de boundary 1–15), `AGENTS.md`.

---

## 1. O que o módulo original declara e contribui

| Ponto | Conteúdo declarado em `module.json`/`manifest.ts` |
| --- | --- |
| **permissions** | `birthdays.read` ("Read birthdays data"), `birthdays.manage` ("Manage birthdays module") |
| **settings** | 9 chaves `birthdays.appearance.*` (cores: fundo, título, mês, 3 cores de card, texto de card, texto de dia, texto de cargo), todas com `defaultValue` hex |
| **navigation** | 1 item admin: `birthdays-admin` → `/admin/modules/birthdays` |
| **routes** | `routes` (2 entradas, admin), `adminRoutes` (2 entradas, formato diferente com `description`), `publicRoutes` (1 entrada) — três arrays paralelos descrevendo praticamente o mesmo conjunto de páginas, cada um com forma ligeiramente distinta |
| **dados próprios** | schema `module_birthdays` (Postgres), tabelas `month_catalog` (12 linhas fixas, FK de `birthdays.month`) e `birthdays` (`full_name`, `role`, `locality`, `month`, `day`, `created_by_user_id` → FK direta para `core.users`, timestamps) |
| **event/job handlers** | nenhum (`eventHandlers: []`, `jobHandlers: []` no manifesto) |
| **blocks** | `birthdays-month-list` declarado no manifesto — **sem** `BlockDefinition`, sem renderer, sem qualquer arquivo que registre esse block em algum block-registry. É metadado morto; a lógica de dado que faria sentido alimentá-lo (`resolveBirthdayMonthBlock`) existe como service/action isolado, nunca conectado a um bloco de verdade. |
| **seeds** | 1 seed obrigatório (`populate-month-catalog`), roda uma função `run()` registrada em `seeds/index.ts`, invocada por um serviço genérico de core (`run-module-seeds.ts`) |
| **views/rotas de fato** | `views-registry.ts` mapeia `"/settings"`, `"/birthdays"` (admin) e `"/birthdays"` (public) para imports dinâmicos de componentes — um mecanismo de resolução de view por chave, próprio do sistema de módulos dinâmicos do fem-colaborador (o próprio README do módulo lista isso como dependência do host ainda não plenamente suportada: "runtime support for module view/component resolution") |
| **setup/lifecycle** | `setup.ts` roda SQL cru idempotente (`CREATE SCHEMA IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, e depois vários `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` / `DROP INDEX IF EXISTS` acumulados no mesmo arquivo — é o histórico de evolução do schema todo escrito como patches idempotentes em vez de migrations versionadas) |

Módulo é `type: "expansion"`, sem `dependencies`. Duas telas admin (dashboard com abas
prévia/registros/importar/impressão, e configurações de aparência) e uma tela pública (quadro do
mês, sem autenticação).

---

## 2. Correspondência com o plugin-engine daqui

| Ponto do original | Equivalente aqui | Observação |
| --- | --- | --- |
| `permissions` | `PluginManifest.permissions` (`manifest-schema.ts`) | Direto. `birthdays.read`/`birthdays.manage` já satisfazem a regra de namespace (`^<key>\.`) porque `key: "birthdays"`. |
| `settings` | `PluginManifest.settings` + `registerDefaultSetting` chamado em `registerPlugins()` para cada plugin ativo | Direto. Leitura via `getSetting` (público, sem auth — mesmo espírito do `getSettingAction` original). Escrita via `setSetting`, que **aqui exige a permission global `settings.manage`**, não uma permission por plugin — ver seção 3, ponto G7. |
| `navigation` | `PluginManifest.navigation` | Forma mais rica aqui: além de `key/label/href`, exige `icon`, `groupKey`, `groupLabel`, `groupOrder`, `order`, `requiredPermission?`. Convenção observada no Academy: `groupKey: "plugins"`, `groupLabel: "Plugins"` — é assim que um plugin "aparece na seção Plugins" pedida no enunciado. Não existe hoje nenhum prefixo de URL `/admin/plugins/<key>`; Academy vive em `/admin/academy` mesmo, só a navegação é que fica agrupada sob o label "Plugins". |
| `routes` (2), `adminRoutes` (2), `publicRoutes` (1) | `PluginManifest.routes` (único array, `{path,label}`) | **`routes` aqui é só metadado descritivo** — `register-plugins.ts` o agrega em `report.routes`, e nada mais no código consome esse campo para montar rota nenhuma. Roteamento real é sempre arquivo literal do App Router (`src/app/(platform)/...`). Confirmei isso checando todo uso de `.routes` no repo: só o `flatMap` que monta o relatório. O manifesto do Academy nem popula esse campo. Ou seja: os três arrays paralelos do original (routes/adminRoutes/publicRoutes) não têm pra onde ir 1:1 — a informação relevante (quais páginas existem) vira só as próprias páginas do App Router; o campo `routes` do manifesto, se usado, seria só documentação. |
| dados próprios (`module_birthdays` schema) | `pgSchema("birthdays")` em `src/plugins/birthdays/database/schema/index.ts` | Direto — é exatamente o padrão do Academy (`academySchema = pgSchema("academy")`). Migrations por `drizzle-kit generate --config=src/plugins/birthdays/drizzle.config.ts`, versionadas em `src/plugins/birthdays/migrations/`, com script próprio em `package.json` (`db:generate:birthdays`/`db:migrate:birthdays`), do mesmo jeito que Academy tem os seus. O `drizzle.config.ts` raiz não inclui `plugins/*` no glob — cada plugin com schema próprio é migrado separadamente, de propósito (ver `academy/drizzle.config.ts`). |
| `created_by_user_id` com FK para `core.users` | **sem FK** — coluna solta (`text`/`uuid`, sem `.references()`) | Regra 7/8 do documento de arquitetura: plugin não pode referenciar schema de outro domínio, nem por FK. Academy já resolve isso assim (`courses.createdBy: text(...)`, sem FK, comentário explicando o motivo) — mesmo tratamento para `birthdays.createdByUserId`. |
| event/job handlers | não existe no `PluginManifest` daqui (não há campo `eventHandlers`/`jobHandlers`) | Sem gap real: o original também declara os dois arrays vazios — nunca usou esse ponto de extensão de fato. |
| `blocks` | `PluginManifest.blocks` + `BlockDefinition`/renderer em `contexts/cms` + `blockDefinitions`/`blockRenderers` exportados pelo barrel do plugin (padrão Academy) | Mapeável 1:1 **se** o block for de fato implementado — o original nunca implementou, então não há nada para "portar" além da intenção (usar o equivalente de `resolveBirthdayMonthBlock` como fonte de dado do bloco). Decisão de produto, não gap técnico. |
| `seeds` | **não existe** no `PluginManifest` daqui | Ver G2 na seção 3 — não recomendo pedir esse ponto de extensão; o dado (12 meses do ano, fixos) não precisa de tabela nem de seed, cabe como constante. |
| `views-registry.ts` / resolução dinâmica de view por chave | **não existe, e não deveria** | Ver G4 na seção 3. |
| `setup.ts` com SQL cru idempotente | migrations versionadas do drizzle-kit | Ver seção 5 (dívida). |

---

## 3. Lacunas, classificadas

### G1 — Ativação/desativação de plugin (persistida, com efeito real em navegação/permissões)
**Classificação: (a) lacuna legítima.**

O enunciado da Fase 2 pede: "desativado não contribui navegação nem permissão, e os dados são
preservados". Hoje **isso não existe no plugin-engine daqui**. `registerPlugins()`
(`platform/plugin-engine/register-plugins.ts`) só filtra por validade de manifesto,
compatibilidade de versão (`isCoreVersionCompatible`) e resolução de dependências
(`resolveDependencies`) — não há nenhum estado persistido de "ligado/desligado" por plugin, nem
ação admin que grave esse estado, nem consumo desse estado em lugar nenhum. Todo plugin em
`PLUGIN_REGISTRY` que passa validação/compat/deps é tratado como sempre ativo.

Isso é o oposto do módulo original: `fem-colaborador/src/core/modules` tem uma máquina de estado
completa (`registered | active | inactive | blocked | invalid | missing | uninstalled`), com
`activate-module.action.ts` / `deactivate-module.action.ts` de verdade. Ou seja, do lado da
referência isso foi feito direito — a lacuna é do lado daqui, no host, não um atalho do módulo
original.

**Não implementei nada disso.** Fica registrado como decisão pendente de aprovação para a Fase 2.
Abordagem que proponho (não implementada): estender `registerPlugins()` para checar, antes de
compatibilidade/dependências, um estado persistido por `plugin.key` (provavelmente uma tabela
pequena e própria do plugin-engine — não do contexto `settings`, que não foi desenhado para isso
— com uma ação admin `activatePlugin`/`deactivatePlugin` seguindo o mesmo padrão handler → service
→ store das demais features). Plugin desativado sai de `activePlugins` (logo, some de
`report.permissions`/`navigation`/`blocks`/settings-registration), mas seu `pgSchema` e tabelas
continuam intactos — desativar nunca dropa dado.

### G2 — `seeds` (popular `month_catalog` com os 12 meses)
**Classificação: mais próxima de (b) atalho indevido — mas o melhor caminho é eliminar a necessidade, não portar o ponto de extensão.**

O original construiu um subsistema inteiro (contrato `ModuleSeedFunction`, `seeds/index.ts` por
módulo, um `run-module-seeds.ts` genérico em core que descobre e roda seeds de todos os módulos)
para popular 12 linhas que **nunca mudam** (janeiro..dezembro, fixas). É estrutura desproporcional
ao problema. Não recomendo pedir um ponto de extensão `seeds` no plugin-engine daqui por causa
disso — a solução mais simples é não ter `month_catalog` como tabela nenhuma: `month` na tabela
`birthdays` vira só uma coluna `integer` com `CHECK (month BETWEEN 1 AND 12)`, e o rótulo
("Janeiro", "Fevereiro", ...) vira uma constante em código (igual `DAYS_PER_MONTH` já é hoje,
tanto no client admin original quanto no schema Zod). Isso elimina a FK, a tabela, e todo o
subsistema de seed de uma vez — sem pedir nada novo ao host.

### G3 — Core conhecendo vocabulário de um módulo específico
**Classificação: (b) atalho indevido — o mais claro dos três.**

Três evidências, todas em `fem-colaborador/src/core/rbac`, não em `src/modules/birthdays`:
1. `core/rbac/contracts/shared.ts:289-295` define `canReadBirthdays`/`canManageBirthdays` como
   funções nomeadas, hardcoded, dentro do **core**.
2. `core/rbac/permission-catalog.ts` tem `"birthdays.read"`/`"birthdays.manage"` no union type do
   catálogo central e nas listas de permissions padrão de `admin`/`superadmin`.
3. `core/database/migrations/0001_mushy_skin.sql` (uma migration do **core**) cria
   `CREATE SCHEMA "module_birthdays"` e as duas tabelas do módulo diretamente — o schema do
   módulo, em algum momento, foi bootstrapado pela história de migration do core, não só pelo
   `setup.ts` do próprio módulo.

Isso é exatamente o que a arquitetura daqui existe para impedir (regra 7 do documento: "plugin só
pode importar de `contexts/<nome>/contracts` e do barrel público... nunca... vale tanto para
leitura quanto escrita" — e o inverso, core sabendo de plugin, é pior ainda porque não tem nem
barrel de permissão). Correspondência correta aqui: handler de cada feature chama
`authorizeActor("birthdays.manage")` (ou `"birthdays.read"`) diretamente, sem função helper
nenhuma em `contexts/rbac` — é o padrão que `academy/features/courses/create-course/handler.ts`
já usa (`authorizeActor("academy.courses.manage")` cru). `RBAC_PERMISSIONS` do core nunca ganha
entrada de `birthdays.*`; essas permissions entram no catálogo agregado só via
`activePlugins.flatMap(p => p.permissions)` dentro de `registerPlugins()`, que já é como o
mecanismo funciona hoje para o Academy.

### G4 — `views-registry.ts` / resolução dinâmica de view por chave
**Classificação: não é lacuna daqui — é arquitetura deliberadamente diferente, não portar.**

O módulo original documenta isso como dependência **não atendida pelo host** ("runtime support
for module view/component resolution", "runtime support for module database schema discovery
without static core imports" — README do módulo, seção "Dependencies for the host instance"). Ou
seja, mesmo na referência, isso é reconhecido como capacidade que o host de lá ainda não entrega
por completo — não é um recurso maduro para copiar.

Aqui a arquitetura já resolveu esse problema de um jeito diferente e mais simples, por decisão
documentada: "Plugins são instalados em código... Next.js exige import estático para bundling"
(`src/plugins/registry.ts`). Não existe, e não deve existir, resolução de view por chave em
runtime — cada rota de plugin é um arquivo real do App Router. Não force isso para (a)/(b): é uma
capacidade que o original quis ter e não tem direito, e que aqui simplesmente não se aplica.

### G5 — `settings.manage` como permission global única para escrever qualquer setting
**Classificação: pendente de decisão de produto, não é bem uma lacuna técnica — ver nota abaixo.**

`setSetting` aqui (`contexts/settings/features/set-setting/handler.ts`) autoriza só com
`authorizeActor("settings.manage")` — uma permission única e global, não por chave/namespace. Um
ator com `birthdays.manage` mas sem `settings.manage` não conseguiria salvar as cores de aparência
do próprio plugin pela action que o formulário de settings chamaria. Preciso confirmar com você se
isso é aceitável (superadmin/admin já têm as duas hoje, então funciona nos papéis padrão) ou se
esperamos que `birthdays.manage` baste para editar `birthdays.appearance.*` — isso exigiria
`setSetting` aceitar uma permission alternativa por namespace de chave, o que é uma mudança em
`contexts/settings`, fora do escopo de "só criar o plugin birthdays". Não é bloqueante para a Fase
2 (os papéis padrão já cobrem o caso), só está registrado para não ser uma surpresa depois.

### G6 — Block `birthdays-month-list` declarado, nunca implementado
**Classificação: não é lacuna do host — é feature inacabada no original.**

Não portar como "block fantasma" (declarar no manifesto sem `BlockDefinition`/renderer
correspondente só copiaria a inconsistência). Se quisermos o block de verdade na Fase 2, é
trabalho novo (igual `academy.course.list`), consumindo o equivalente local de
`resolveBirthdayMonthBlock`. Decisão de escopo, converso com você antes de incluir ou não.

---

## 4. Onde o original toca dado que não é dele, e o caminho correto aqui

| Dado tocado | Como o original acessa | Caminho correto aqui |
| --- | --- | --- |
| Usuário que criou o registro (`created_by_user_id`) | FK direta `references(() => users.id)` no schema do módulo, apontando pra tabela `core.users` | Sem FK — coluna solta (`actorId`/`createdByUserId` como `uuid`/`text`, sem `.references()`), igual `academy.courses.createdBy`. Se algum dia for preciso exibir nome/e-mail de quem criou, resolve via função pública exportada por `@/contexts/auth` (ex.: um `getUser`), nunca por join. |
| Verificação de permissão (`canManageBirthdays`/`canReadBirthdays`) | Funções hardcoded **dentro do core** (`core/rbac/contracts/shared.ts`) — o core conhece o vocabulário do módulo | `authorizeActor("birthdays.manage")` / `authorizeActor("birthdays.read")` chamado direto de cada `handler.ts` do plugin, importado do barrel `@/contexts/rbac`. Nenhum código novo em `contexts/rbac` sabendo o nome "birthdays". |
| Settings de aparência (`birthdays.appearance.*`) | Via `getSettingAction`/`setSettingAction` do core (`@/core/settings`) — **este já é o único ponto do módulo original que segue o padrão certo** | Mesmo padrão aqui: `getSetting`/`setSetting` de `@/contexts/settings`, só isso. Nenhuma mudança de abordagem necessária, só de import. |
| Identidade visual / marca (logo, `headerBrandMode`, cor da marca) — usado na geração do PDF de impressão | `getPlatformIdentity()` de `@/lib/platform/identity`, import direto de módulo de plataforma | Preciso localizar o equivalente aqui antes da Fase 2 (candidato: algo dentro de `contexts/settings` ou um context de branding próprio — não mapeei isso ainda porque não fazia parte do pedido desta fase). Registrado como pendência de pesquisa, não como decisão. |
| Locale/tradução (`useLocale`, `translate`, `locales/pt-br.ts`/`en.ts`) | Infra de i18n própria da plataforma fem-colaborador, bilíngue (en/pt-br) | Ver seção 5 — meu entendimento é que o pedido aqui ("datas em formato brasileiro", uso operacional recorrente) aponta para pt-BR fixo, sem reintroduzir uma camada de i18n. Sinalizando para sua decisão, não assumindo. |

---

## 5. O que é dívida e não deve ser portado

- **Sistema de módulo dinâmico inteiro** (`core/modules/actions/install-module-from-zip.action.ts`,
  `sync-filesystem-modules.action.ts`, máquina de estado `registered/active/inactive/blocked/...`
  em `registry.ts` do core, upload de `.zip`) — incompatível por design com "plugin instalado em
  código, import estático" daqui. Não portar nada dessa camada; G1 propõe algo bem mais enxuto
  (só um flag ativo/inativo persistido), não uma reconstrução desse sistema.
- **`views-registry.ts` e resolução de view por chave** — substituído por arquivos reais do App
  Router (G4).
- **`setup.ts` com SQL cru idempotente acumulando patches** (`CREATE TABLE IF NOT EXISTS` seguido
  de vários `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` no mesmo arquivo, representando o
  histórico de mudanças de schema como comandos condicionais em vez de migrations numeradas) —
  substituir por migrations versionadas do `drizzle-kit generate`, uma por mudança real —
  exatamente o motivo do aviso do usuário sobre timestamp fabricado: aqui a disciplina de
  migration é tratada como sério, lá era tratada como script de bootstrap reexecutável.
- **Subsistema de seeds para 12 linhas fixas** (G2) — vira constante em código.
- **`canReadBirthdays`/`canManageBirthdays` em core, e as entradas de `birthdays.*` no catálogo
  estático de core / migration de core** (G3) — não portar essa forma; permissions nascem só do
  manifesto do plugin.
- **Block `birthdays-month-list` declarado sem implementação** (G6) — não portar como declaração
  vazia.
- **Camada bilíngue própria** (`locales/en.ts`, `locales/pt-br.ts`, `translate()`) — a menos que
  você confirme que quer manter inglês, o pedido de UX desta tarefa (datas em formato brasileiro,
  ferramenta de consulta operacional) sugere pt-BR fixo, sem reconstruir infraestrutura de i18n
  só para este plugin.
- **Parser de CSV manual, client-side, por vírgula fixa** (`views/admin/client.tsx`,
  `parseAndValidateCsv`) — funciona, mas quebra silenciosamente com nomes contendo vírgula e não
  tem cobertura de teste própria (só os services de import têm teste, o parser client-side não).
  Não é motivo para travar a Fase 2, mas não deve ser copiado sem revisão se o import CSV entrar
  no escopo.
- **Três arrays paralelos de rota no manifesto** (`routes`/`adminRoutes`/`publicRoutes`, formas
  ligeiramente diferentes descrevendo praticamente as mesmas páginas) — aqui existe um único
  campo `routes`, descritivo; não recriar a redundância.

---

## Decisões que preciso de OK antes da Fase 2

1. **G1 (ativação/desativação)** é a lacuna que mais importa: implica estender o
   `platform/plugin-engine` com um novo mecanismo de estado persistido por plugin — não é "só
   criar o plugin birthdays", é tocar o motor. Confirma que quer que eu implemente isso agora,
   junto com o plugin, ou prefere que o birthdays entre primeiro sempre-ativo (como o Academy hoje)
   e a ativação/desativação vire um pedido separado?
2. **Escopo do block `birthdays-month-list`** (G6) — implementar de verdade (CMS block real) ou
   deixar de fora desta rodada?
3. **i18n** — pt-BR fixo (minha recomendação) ou manter inglês/português como no original?
4. **Identidade visual no PDF de impressão** — preciso localizar o equivalente daqui de
   `getPlatformIdentity()` antes de saber se a função de impressão do original é portável como
   está; ok eu pesquisar isso como parte da Fase 2, ou você já sabe onde fica?

Nada disto foi implementado. Nenhum ponto de extensão novo foi criado no plugin-engine. Aguardando
seu aval para a Fase 2.
