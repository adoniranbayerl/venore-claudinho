import { setSetting } from "@/contexts/settings";
import type { ActivateColorPaletteInput, ActivateColorPaletteResult } from "./types";

// Validação de "esta paletteId existe no catálogo do tema ativo" fica fora daqui de propósito —
// contexts/themes não pode depender de src/themes/registry.ts (regra 12 do documento de
// arquitetura, UI/framework). Quem cruza os dois é platform/theme-engine/activate-color-
// palette.ts, mesmo papel de platform/theme-rendering/resolve-active-theme.ts.
export async function activateColorPalette(command: ActivateColorPaletteInput): Promise<ActivateColorPaletteResult> {
  const result = await setSetting({ key: "theme.activePaletteId", value: command.paletteId });
  if (!result.success) {
    return result;
  }

  return { success: true, data: { paletteId: command.paletteId, activatedAt: result.data.updatedAt } };
}
