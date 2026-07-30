"use server";

import { cookies } from "next/headers";
import { SIDEBAR_COLLAPSED_COOKIE } from "./get-sidebar-collapsed";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Server Action ligada ao botão de colapso no canto superior direito do frame da sidebar
// (SidebarLeftSlotProps.onToggleCollapsed) — mesmo padrão de toggle-nav-mode-action.ts. Só
// inverte o cookie; o refresh da rota atual disparado pela Server Action já basta pro layout
// reler o cookie no próximo render.
export async function toggleSidebarCollapsedAction(): Promise<void> {
  const store = await cookies();
  const current = store.get(SIDEBAR_COLLAPSED_COOKIE)?.value === "true";
  store.set(SIDEBAR_COLLAPSED_COOKIE, current ? "false" : "true", {
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    path: "/",
  });
}
