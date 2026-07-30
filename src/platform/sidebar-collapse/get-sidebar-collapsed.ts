import { cookies } from "next/headers";

const SIDEBAR_COLLAPSED_COOKIE = "sidebar-collapsed";

// Mesmo raciocínio de src/platform/nav-mode/get-nav-mode.ts: o servidor precisa saber se a
// sidebar está colapsada ANTES do primeiro paint, pra montar a largura certa de cara — cookie
// lido no layout, não useState client (docs/ui/shell-spec.md §3.3, item "não portar" #3). Sem
// cookie, o padrão é expandida.
export async function getSidebarCollapsed(): Promise<boolean> {
  const store = await cookies();
  return store.get(SIDEBAR_COLLAPSED_COOKIE)?.value === "true";
}

export { SIDEBAR_COLLAPSED_COOKIE };
