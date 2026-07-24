import { getActiveTheme } from "@/contexts/themes";
import { THEME_REGISTRY, type ThemeRegistryEntry } from "@/themes/registry";

// Ponto de composição fora de contexts/themes (que precisa ficar livre de UI/framework, docs
// linha 112) e fora de src/themes/registry.ts (que é só o fato estático "quais temas existem",
// sem saber qual está ativo). Cruzar "qual tema está ativo" (contexts/themes, banco/cache) com
// "quais componentes implementam aquele tema" (registro estático de código) é responsabilidade
// de platform/, mesmo papel de platform/registration/handle-user-registered.ts.
export async function resolveActiveTheme(): Promise<ThemeRegistryEntry> {
  const active = await getActiveTheme();
  const themeKey = active.success ? active.data.themeKey : "default";

  return THEME_REGISTRY[themeKey] ?? THEME_REGISTRY.default;
}
