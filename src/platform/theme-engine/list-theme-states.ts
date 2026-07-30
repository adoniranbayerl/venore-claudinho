import { getActiveTheme, type ThemeManifest } from "@/contexts/themes";
import { listExtensionStates } from "@/contexts/extensions";
import { THEME_REGISTRY } from "@/themes/registry";

export type ThemeStateView = {
  manifest: ThemeManifest;
  enabled: boolean;
  isActive: boolean;
  // false + disableBlockedReason preenchido == controle desabilitado na UI, com o motivo visível
  // (docs/venore-docks.md — "com apenas um tema instalado, o controle aparece desabilitado com o
  // motivo visível — não escondido").
  canDisable: boolean;
  disableBlockedReason: string | null;
};

// Composição pra tela /admin/themes: junta o registro estático (THEME_REGISTRY) com o estado de
// habilitação (contexts/extensions) e o tema ativo (contexts/themes), e já resolve se cada tema
// PODE ser desabilitado agora — a UI não recalcula essa regra, só reflete o que veio daqui.
export async function listThemeStates(): Promise<ThemeStateView[]> {
  const [activeThemeResult, enabledStatesResult] = await Promise.all([
    getActiveTheme(),
    listExtensionStates({ kind: "theme" }),
  ]);

  const activeThemeKey = activeThemeResult.success ? activeThemeResult.data.themeKey : null;
  const enabledStates = enabledStatesResult.success ? enabledStatesResult.data : {};

  const themes = Object.values(THEME_REGISTRY);
  const enabledCount = themes.filter((theme) => enabledStates[theme.manifest.key] ?? true).length;

  return themes.map(({ manifest }) => {
    const enabled = enabledStates[manifest.key] ?? true;
    const isActive = manifest.key === activeThemeKey;

    let disableBlockedReason: string | null = null;
    if (isActive) {
      disableBlockedReason = "Não é possível desabilitar o tema ativo.";
    } else if (enabled && enabledCount <= 1) {
      disableBlockedReason = "Não é possível ficar sem nenhum tema habilitado — pelo menos um precisa continuar disponível.";
    }

    return {
      manifest,
      enabled,
      isActive,
      canDisable: enabled && disableBlockedReason === null,
      disableBlockedReason,
    };
  });
}
