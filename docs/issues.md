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

- **G6 — Block `birthdays-month-list` não implementado.** O manifesto do plugin original
  declarava um block `birthdays-month-list` sem nenhum `BlockDefinition`/renderer real — decidiu-se
  não portar essa declaração vazia (copiaria a inconsistência) nem implementar o block de verdade
  nesta sessão. Fica dependente das issues abertas do page-builder (o mecanismo de blocks de
  `contexts/cms` + `platform/page-builder`) antes de virar trabalho real, no mesmo padrão de
  `academy.course.list`/`academy.course.card`.

- **Identidade visual / impressão.** A função de impressão (PDF do quadro de aniversariantes) do
  módulo original usava `getPlatformIdentity()` (logo, `headerBrandMode`, cor da marca). Não
  localizei nem usei o equivalente daqui (`src/platform/brand/get-brand-config.ts`) — decisão
  explícita desta sessão foi não tocar nisso, não criar helper local de brand nem ler
  `public/brand` diretamente do plugin. Fica dependente de uma sessão dedicada ao subsistema de
  brand/impressão antes de ser retomado.

- **Importação CSV.** Fora do escopo desta sessão. No módulo original
  (`fem-colaborador/src/modules/birthdays/views/admin/client.tsx`, função
  `parseAndValidateCsv`), o parser é client-side, faz split por vírgula fixo, funciona mas quebra
  silenciosamente com nome contendo vírgula, e não tem teste próprio (só os `services` de import
  têm cobertura). Se entrar em escopo depois, não copiar esse parser sem revisão — pelo menos
  trocar por um parser de CSV de verdade (aspas/escape) e cobrir com teste.
