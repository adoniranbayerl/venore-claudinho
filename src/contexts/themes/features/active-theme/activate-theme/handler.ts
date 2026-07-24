// Autorização é responsabilidade de contexts/settings/features/set-setting/handler.ts
// (permission "settings.manage") — este handler só valida o input específico de temas.
import { activateTheme } from "./service";
import type { ActivateThemeInput, ActivateThemeResult } from "./types";

export async function activateThemeHandler(input: ActivateThemeInput): Promise<ActivateThemeResult> {
  if (input.themeKey.trim().length === 0) {
    return { success: false, error: { code: "themes.activation.invalid_key", message: "themeKey não pode ser vazio." } };
  }

  return activateTheme(input);
}
