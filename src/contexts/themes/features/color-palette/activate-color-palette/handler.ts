// Autorização é responsabilidade de contexts/settings/features/set-setting/handler.ts
// (permission "settings.manage") — este handler só valida o input específico de paletas.
import { activateColorPalette } from "./service";
import type { ActivateColorPaletteInput, ActivateColorPaletteResult } from "./types";

export async function activateColorPaletteHandler(input: ActivateColorPaletteInput): Promise<ActivateColorPaletteResult> {
  if (input.paletteId.trim().length === 0) {
    return { success: false, error: { code: "themes.color_palette.invalid_id", message: "paletteId não pode ser vazio." } };
  }

  return activateColorPalette(input);
}
