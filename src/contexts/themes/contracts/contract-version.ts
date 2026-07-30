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
//
// Bump para "4.0.0": `scrollState` foi REMOVIDO de HeaderSlotProps (docs/ui/shell-spec.md §2,
// implementação do header reativo ao scroll). Mesmo raciocínio do bump para "3.0.0": scroll é
// estado de runtime só do client, não algo resolvível em request/render do servidor — o valor que
// vinha por prop estava hardcoded em `false` (mock-data.ts) porque não havia outra fonte possível.
// Detecção passa a viver inteiramente em HeaderScrollSentinel (IntersectionObserver, único client
// component novo), que escreve `data-scrolled` direto no <header> via DOM; o resto do header reage
// via seletor CSS (`data-[scrolled=true]` / `group-data-[scrolled=true]/header`), sem prop nem
// re-render React — abrindo mão, só para o scroll do header, do mesmo princípio "o tema nunca lê
// estado sozinho" que a remoção de isDark/onToggleColorMode já abriu mão para o color mode.
// Bump para "5.0.0": `SitemapItem` deixou de ser `{ key, label, href }` (lista plana) e virou uma
// árvore (`children: SitemapItem[]`, `href: string | null`, `isExternal`) — mudança de shape, não
// extensão aditiva, porque o consumo mudou de "lista de links" para "coluna com cabeçalho +
// filhos" (footer real a partir do menu de location "sitemap" de contexts/cms, que já resolve
// nessa forma). `FooterSlotProps.brand` também passou de `{ name, logoUrl? }` pra `HeaderBrand &
// { color }`, mesma composição já usada no Header e na impressão de PDF do birthdays — sem isso o
// footer não conseguia renderizar a marca de verdade (só o nome em texto).
export const CURRENT_THEME_CONTRACT_VERSION = "5.0.0";
export const SUPPORTED_THEME_CONTRACT_RANGE = "^5.0.0";
