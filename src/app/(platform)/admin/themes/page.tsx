import { getActiveTheme } from "@/contexts/themes";
import { getSettingsPageData } from "@/platform/admin-shell/get-settings-page-data";
import { THEME_REGISTRY } from "@/themes/registry";
import { ActivateThemeButton } from "./_components/activate-theme-button";

export default async function ThemesAdminPage() {
  const gate = await getSettingsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar temas.</p>
      </div>
    );
  }

  const activeThemeResult = await getActiveTheme();
  if (!activeThemeResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar o tema ativo: {activeThemeResult.error.message}</p>;
  }

  const activeThemeKey = activeThemeResult.data.themeKey;
  const themes = Object.values(THEME_REGISTRY);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Temas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Escolha o tema ativo do site, entre os temas instalados.</p>
      </div>

      <section className="rounded border border-border bg-card p-4">
        <ul className="space-y-3">
          {themes.map(({ manifest }) => (
            <li key={manifest.key} className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">{manifest.name}</span>{" "}
                <span className="text-muted-foreground/56">
                  ({manifest.key}, v{manifest.version})
                </span>
                {manifest.key === activeThemeKey && (
                  <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Ativo</span>
                )}
              </div>
              <ActivateThemeButton themeKey={manifest.key} disabled={manifest.key === activeThemeKey} />
            </li>
          ))}
          {themes.length === 0 && <li className="text-sm text-muted-foreground/56">Nenhum tema instalado.</li>}
        </ul>
      </section>
    </div>
  );
}
