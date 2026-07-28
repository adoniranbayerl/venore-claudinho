import { cache } from "react";
import { getActiveTheme } from "@/contexts/themes";
import { THEME_REGISTRY, type ThemeRegistryEntry } from "@/themes/registry";

// Ponto de composição fora de contexts/themes (que precisa ficar livre de UI/framework, docs
// linha 112) e fora de src/themes/registry.ts (que é só o fato estático "quais temas existem",
// sem saber qual está ativo). Cruzar "qual tema está ativo" (contexts/themes, banco/cache) com
// "quais componentes implementam aquele tema" (registro estático de código) é responsabilidade
// de platform/, mesmo papel de platform/registration/handle-user-registered.ts.
//
// cache() memoiza por request: RootLayout (data-theme no <html>) e PlatformLayout (Slots) chamam
// isso de forma independente no mesmo request, e sem memoização isso seria 2 leituras de
// contexts/settings por página em vez de 1.
export const resolveActiveTheme = cache(async (): Promise<ThemeRegistryEntry> => {
  const active = await getActiveTheme();
  const themeKey = active.success ? active.data.themeKey : "venore-slime";

  return THEME_REGISTRY[themeKey] ?? THEME_REGISTRY["venore-slime"];
});
