import { activateColorPalette as persistActiveColorPalette } from "@/contexts/themes";
import type { ActivateColorPaletteResult } from "@/contexts/themes";
import { resolveActiveTheme } from "@/platform/theme-rendering/resolve-active-theme";
import { CUSTOM_COLOR_PALETTE_ID } from "./custom-color-palette-id";

export type ActivateColorPaletteInput = { paletteId: string };

// Composição do ponto de wiring (mesmo raciocínio de toggle-theme-enabled.ts, docs/venore-docks.md
// regra 12): validar "esta paletteId existe no catálogo do tema ativo" exige THEME_REGISTRY (via
// resolveActiveTheme), que contexts/themes não pode importar — por isso mora aqui, não no
// service do context. "default" é sempre válido (significa "sem override", nunca precisa constar
// no catálogo); "custom" também é sempre válido pelo mesmo motivo — vem de contexts/settings
// (platform/theme-engine/custom-color-palette.ts), não do catálogo em código de nenhum tema.
export async function activateColorPalette(command: ActivateColorPaletteInput): Promise<ActivateColorPaletteResult> {
  if (command.paletteId !== "default" && command.paletteId !== CUSTOM_COLOR_PALETTE_ID) {
    const { colorPalettes } = await resolveActiveTheme();
    const exists = colorPalettes.some((palette) => palette.id === command.paletteId);
    if (!exists) {
      return {
        success: false,
        error: {
          code: "theme-engine.color_palette.not_found",
          message: `Paleta "${command.paletteId}" não existe no catálogo do tema ativo.`,
        },
      };
    }
  }

  return persistActiveColorPalette({ paletteId: command.paletteId });
}
