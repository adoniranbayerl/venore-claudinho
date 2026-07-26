// Versão do contrato de slot que o core oferece hoje, e o intervalo semver que ele aceita de um
// tema (docs/venore-docks.md — "themeContractVersion", mesmo princípio do
// compatibility.coreVersion do manifesto de plugin). Um tema com themeContractVersion fora deste
// intervalo não é ativável.
//
// Decisão: HeaderSlotProps ganhou os campos user/canAccessAdmin/onSignOut, e depois
// isDark/onToggleColorMode, sem remover ou mudar nenhum campo existente (extensão puramente
// aditiva). Não houve bump de versão porque venore-slime é o único tema registrado
// (src/themes/registry.ts) e ainda não foi publicado fora deste repo — não existe consumidor
// externo que dependa do shape anterior. Revisitar esta decisão (bump para "2.1.0" + range
// "^2.1.0") no dia em que um segundo tema for publicado.
export const CURRENT_THEME_CONTRACT_VERSION = "2.0.0";
export const SUPPORTED_THEME_CONTRACT_RANGE = "^2.0.0";
