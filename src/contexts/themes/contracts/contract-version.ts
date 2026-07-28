// Versão do contrato de slot que o core oferece hoje, e o intervalo semver que ele aceita de um
// tema (docs/venore-docks.md — "themeContractVersion", mesmo princípio do
// compatibility.coreVersion do manifesto de plugin). Um tema com themeContractVersion fora deste
// intervalo não é ativável.
//
// Histórico: HeaderSlotProps ganhou os campos user/canAccessAdmin/onSignOut, e depois
// isDark/onToggleColorMode, sem remover ou mudar nenhum campo existente (extensão puramente
// aditiva) — por isso não houve bump de versão nesse período.
//
// Bump para "3.0.0": isDark/onToggleColorMode foram REMOVIDOS de HeaderSlotProps — decisão do
// usuário (2026-07-28), ao reinstalar os primitivos shadcn stock, de adotar `next-themes`
// (exigido pelo `sonner` stock) em vez do mecanismo anterior de cookie + Server Action
// (platform/ui-preferences). O tema passa a ler o color mode via `useTheme()` do próprio
// `next-themes`, não mais via prop resolvida pelo core — abrindo mão, só para o dark/light
// toggle, do princípio "o tema nunca lê estado sozinho" (docs/venore-docks.md — "Contrato de
// slot"). Trade-off deliberado e explícito do usuário, não um desvio silencioso. Diferente do
// histórico aditivo acima, isto é remoção de campo — quebra de shape, daí o bump (mesma lógica
// de "revisitar no dia em que houver mudança que não seja puramente aditiva").
export const CURRENT_THEME_CONTRACT_VERSION = "3.0.0";
export const SUPPORTED_THEME_CONTRACT_RANGE = "^3.0.0";
