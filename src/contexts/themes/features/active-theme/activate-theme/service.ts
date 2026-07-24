import semver from "semver";
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

  // Persistência, autorização (settings.manage) e invalidação de cache são responsabilidade de
  // contexts/settings (regra 10 — service chama service público de outro context via barrel).
  const result = await setSetting({ key: "theme.active", value: command.themeKey });
  if (!result.success) {
    return result;
  }

  return { success: true, data: { themeKey: command.themeKey, activatedAt: result.data.updatedAt } };
}
