# Issues — pedidos e lacunas registradas fora do escopo de uma sessão

Lista de trabalho futuro identificado durante o desenvolvimento de um plugin/feature, mas
deliberadamente deixado fora da sessão que o identificou. Cada entrada diz o que é, por que ficou
de fora, e (quando aplicável) de que depende para ser retomado.

## Plugin `birthdays` (Fase 2 — cadastro de aniversariantes)

- **G1 — Ativação/desativação de plugin (persistida, com efeito real em navegação/permissões).**
  Hoje `registerPlugins()` (`src/platform/plugin-engine/register-plugins.ts`) trata todo plugin em
  `PLUGIN_REGISTRY` como sempre ativo — não existe estado persistido de "ligado/desligado" por
  plugin, nem ação admin que grave esse estado. O plugin `birthdays` entrou sempre-ativo, no mesmo
  padrão do `academy`. Implementar isso implica estender o motor do plugin-engine (não é "só criar
  um plugin novo"). **Observação importante:** o modelo atual instala plugins em código com import
  estático (`src/plugins/registry.ts` — Next.js exige isso pra bundling); qualquer desativação
  precisaria acontecer depois desse import já ter resolvido em build-time, então o plugin continua
  fisicamente presente no bundle mesmo "desativado" — isso reduz bastante o valor prático dessa
  capacidade frente a um sistema de módulos com resolução em runtime (como o `fem-colaborador`
  original tinha). Vale essa ressalva antes de priorizar a implementação.
  Detalhado em `docs/plugins/birthdays-port.md`, seção 3 (G1).

- **G5 — `settings.manage` como permission global única pra escrever qualquer setting.**
  `setSetting` (`src/contexts/settings/features/set-setting/handler.ts`) autoriza só com
  `authorizeActor("settings.manage")` — não há escopo por namespace de chave. Um ator com
  `birthdays.manage` mas sem `settings.manage` não consegue salvar a paleta de aparência do
  próprio plugin em `/admin/birthdays/appearance` (a ação delega pra `setSetting`, que exige a
  permission global). Não é bloqueante — os papéis padrão (admin/superadmin) já têm as duas — mas
  fica registrado pra não surpreender configurações de RBAC mais granulares depois. Resolver
  exigiria `setSetting` aceitar uma permission alternativa por namespace de chave, mudança em
  `contexts/settings`, fora do escopo de "criar o plugin birthdays".

- **G6 — Block `birthdays-month-list` — RESOLVIDO.** Implementado em `src/plugins/birthdays/blocks/`
  (`birthdays.month.list`), registrado em `platform/page-builder/block-registry.ts` e
  `block-renderers.tsx`, no mesmo padrão de `academy.course.list`. Não é fidelidade visual com o
  bloco original do fem-colaborador (pedido explícito: "não precisa ter fidelidade visual, pode
  gerar algo que você acredita ser melhor") — usa tokens do tema (`bg-card`, `border-border`, etc.)
  em vez das cores de `birthdays.appearance.*`, e ordena os aniversariantes do mês corrente
  colocando "hoje em diante" antes de quem já fez aniversário no mês, com destaque para quem faz
  aniversário hoje.

- **Identidade visual / impressão — RESOLVIDO.** A impressão de PDF (`src/plugins/birthdays/
  features/print-birthdays/`) já usa `getBrandConfig()` (`src/platform/brand/get-brand-config.ts`)
  para logo/nome/cor da marca — inclusive um campo `color`/`brand.color` novo, adicionado ali
  porque nada expunha isso ainda (o Header do tema não pinta a marca por cor de setting). Decisão
  explícita: não criar subsistema de brand paralelo nem helper local no plugin — quando um
  subsistema real existe (como já era o caso pra logo/nome), ele absorve a leitura.

- **Importação CSV.** Fora do escopo desta sessão. No módulo original
  (`fem-colaborador/src/modules/birthdays/views/admin/client.tsx`, função
  `parseAndValidateCsv`), o parser é client-side, faz split por vírgula fixo, funciona mas quebra
  silenciosamente com nome contendo vírgula, e não tem teste próprio (só os `services` de import
  têm cobertura). Se entrar em escopo depois, não copiar esse parser sem revisão — pelo menos
  trocar por um parser de CSV de verdade (aspas/escape) e cobrir com teste.
