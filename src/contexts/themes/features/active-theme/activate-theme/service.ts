import semver from "semver";
import { getExtensionState } from "@/contexts/extensions";
import { setSetting } from "@/contexts/settings";
import { SUPPORTED_THEME_CONTRACT_RANGE } from "../../../contracts/contract-version";
import type { ActivateThemeInput, ActivateThemeResult } from "./types";

export async function activateTheme(command: ActivateThemeInput): Promise<ActivateThemeResult> {
  if (!semver.satisfies(command.themeContractVersion, SUPPORTED_THEME_CONTRACT_RANGE)) {
    return {
      success: false,
      error: {
        code: "themes.activation.incompatible_contract_version",
        message: `Tema "${command.themeKey}" declara themeContractVersion "${command.themeContractVersion}", incompatível com o intervalo suportado "${SUPPORTED_THEME_CONTRACT_RANGE}".`,
      },
    };
  }

  // Tema desabilitado não é selecionável (docs/venore-docks.md) — checado aqui, na própria
  // ativação, não só na tela de administração, pra valer pra qualquer chamador.
  const extensionState = await getExtensionState({ kind: "theme", key: command.themeKey });
  if (!extensionState.success) {
    return extensionState;
  }
  if (!extensionState.data.enabled) {
    return {
      success: false,
      error: {
        code: "themes.activation.disabled",
        message: `Tema "${command.themeKey}" está desabilitado e não pode ser selecionado.`,
      },
    };
  }

  // Persistência, autorização (settings.manage) e invalidação de cache são responsabilidade de
  // contexts/settings (regra 10 — service chama service público de outro context via barrel).
  const result = await setSetting({ key: "theme.active", value: command.themeKey });
  if (!result.success) {
    return result;
  }

  return { success: true, data: { themeKey: command.themeKey, activatedAt: result.data.updatedAt } };
}
