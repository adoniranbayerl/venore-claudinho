// Leitura pública: precisa resolver o tema para renderizar o site para qualquer visitante,
// autenticado ou não — sem input, sem authorizeActor.
import { getActiveTheme } from "./service";
import type { GetActiveThemeResult } from "./types";

export async function getActiveThemeHandler(): Promise<GetActiveThemeResult> {
  return getActiveTheme();
}
