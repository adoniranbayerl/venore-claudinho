import { Badge } from "@/components/ui/badge";
import { getActiveTheme } from "@/contexts/themes";
import { getSettingsPageData } from "@/platform/admin-shell/get-settings-page-data";
import { THEME_REGISTRY } from "@/themes/registry";
import { ActivateThemeButton } from "./_components/activate-theme-button";

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

  const activeThemeResult = await getActiveTheme();
  if (!activeThemeResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar o tema ativo agora. Tente recarregar a página.</p>;
  }

  const activeThemeKey = activeThemeResult.data.themeKey;
  const themes = Object.values(THEME_REGISTRY);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Aparência</h1>
        <p className="mt-1 text-sm text-muted-foreground">Escolha o tema visual usado no site, entre os temas instalados.</p>
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <ul className="space-y-3">
          {themes.map(({ manifest }) => (
            <li key={manifest.key} className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{manifest.name}</span>
                {manifest.key === activeThemeKey && <Badge variant="secondary">Ativo</Badge>}
              </div>
              {manifest.key !== activeThemeKey && <ActivateThemeButton themeKey={manifest.key} />}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
