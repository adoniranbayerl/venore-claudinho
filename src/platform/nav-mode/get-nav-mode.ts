import { cookies } from "next/headers";
import type { NavMode } from "@/contexts/themes";

const NAV_MODE_COOKIE = "nav-mode";

// navMode é um toggle manual persistido em cookie (docs/venore-docks.md — "Shell única"),
// não detecção automática por rota. Se o ator não puder alternar pra admin-nav, ignora o
// cookie e força "main" — evita nav admin "grudada" caso a permission seja revogada depois.
export async function getNavMode(canToggleAdminNav: boolean): Promise<NavMode> {
  if (!canToggleAdminNav) {
    return "main";
  }

  const store = await cookies();
  return store.get(NAV_MODE_COOKIE)?.value === "admin" ? "admin" : "main";
}

export { NAV_MODE_COOKIE };
