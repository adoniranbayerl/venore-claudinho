"use server";

import { cookies } from "next/headers";
import { NAV_MODE_COOKIE } from "./get-nav-mode";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Server Action ligada ao botão de alternância do Header (contrato de slot —
// HeaderSlotProps.onToggleNavMode). Só inverte o cookie; o refresh da rota atual disparado
// pela Server Action já basta pro layout reler o cookie no próximo render.
export async function toggleNavModeAction(): Promise<void> {
  const store = await cookies();
  const current = store.get(NAV_MODE_COOKIE)?.value === "admin" ? "admin" : "main";
  store.set(NAV_MODE_COOKIE, current === "admin" ? "main" : "admin", {
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    path: "/",
  });
}
