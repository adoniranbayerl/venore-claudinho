import { getActiveTheme } from "@/contexts/themes";
import { listExtensionStates, setExtensionEnabled } from "@/contexts/extensions";
import type { OperationResult } from "@/shared/types";
import { THEME_REGISTRY } from "@/themes/registry";

export type ToggleThemeEnabledInput = { themeKey: string; enabled: boolean };

// Composição do ponto de wiring (docs/venore-docks.md — regra 12): as duas invariantes de tema
// (não desabilitar o ativo, não ficar sem nenhum habilitado) exigem THEME_REGISTRY e o tema
// ativo, então moram aqui — não em contexts/extensions, que só sabe persistir a chave liga/
// desliga.
export async function toggleThemeEnabled(command: ToggleThemeEnabledInput): Promise<OperationResult<void>> {
  if (!command.enabled) {
    const activeThemeResult = await getActiveTheme();
    if (!activeThemeResult.success) {
      return activeThemeResult;
    }
    if (activeThemeResult.data.themeKey === command.themeKey) {
      return {
        success: false,
        error: {
          code: "theme-engine.disable.active_theme",
          message: `Não é possível desabilitar o tema ativo ("${command.themeKey}") — ative outro tema antes.`,
        },
      };
    }

    const enabledStatesResult = await listExtensionStates({ kind: "theme" });
    const enabledStates = enabledStatesResult.success ? enabledStatesResult.data : {};
    const enabledCount = Object.keys(THEME_REGISTRY).filter((key) => enabledStates[key] ?? true).length;
    if (enabledCount <= 1) {
      return {
        success: false,
        error: {
          code: "theme-engine.disable.last_enabled_theme",
          message: "Não é possível desabilitar o último tema habilitado — pelo menos um tema precisa continuar disponível.",
        },
      };
    }
  }

  const result = await setExtensionEnabled({ kind: "theme", key: command.themeKey, enabled: command.enabled });
  if (!result.success) {
    return result;
  }

  return { success: true, data: undefined };
}
