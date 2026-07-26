"use server";

import { cookies } from "next/headers";
import { COLOR_MODE_COOKIE } from "./get-color-mode";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Server Action ligada ao form de ColorModeToggle. Só inverte o cookie; o refresh da rota
// atual disparado pela Server Action já basta pro layout reler o cookie no próximo render.
export async function toggleColorModeAction(): Promise<void> {
  const store = await cookies();
  const current = store.get(COLOR_MODE_COOKIE)?.value === "dark";
  store.set(COLOR_MODE_COOKIE, current ? "light" : "dark", {
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    path: "/",
  });
}
