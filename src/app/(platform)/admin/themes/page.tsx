import { Badge } from "@/components/ui/badge";
import { getSettingsPageData } from "@/platform/admin-shell/get-settings-page-data";
import { listThemeStates } from "@/platform/theme-engine/list-theme-states";
import { ActivateThemeButton } from "./_components/activate-theme-button";
import { ToggleThemeControl } from "./_components/toggle-theme-control";

export default async function ThemesAdminPage() {
  const gate = await getSettingsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar temas.</p>
      </div>
    );
  }

  const themes = await listThemeStates();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Aparência</h1>
        <p className="mt-1 text-sm text-muted-foreground">Escolha o tema visual usado no site, entre os temas instalados e habilitados.</p>
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <ul className="space-y-3">
          {themes.map(({ manifest, enabled, isActive, canDisable, disableBlockedReason }) => (
            <li key={manifest.key} className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{manifest.name}</span>
                {isActive && <Badge variant="secondary">Ativo</Badge>}
              </div>
              <div className="flex items-center gap-2">
                {!isActive && enabled && <ActivateThemeButton themeKey={manifest.key} />}
                <ToggleThemeControl
                  themeKey={manifest.key}
                  themeName={manifest.name}
                  enabled={enabled}
                  canDisable={canDisable}
                  disableBlockedReason={disableBlockedReason}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
