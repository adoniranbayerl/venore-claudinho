import { getActiveTheme } from "@/contexts/themes";
import { getSettingsPageData } from "@/platform/admin-shell/get-settings-page-data";
import { THEME_REGISTRY } from "@/themes/registry";
import { ActivateThemeButton } from "./_components/activate-theme-button";

export default async function ThemesAdminPage() {
  const gate = await getSettingsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border-subtle bg-surface-panel p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">Acesso negado</h1>
        <p className="mt-2 text-sm text-text-secondary">Você não tem permissão para gerenciar temas.</p>
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
        <h1 className="text-xl font-semibold text-text-primary">Temas</h1>
        <p className="mt-1 text-sm text-text-secondary">Escolha o tema ativo do site, entre os temas instalados.</p>
      </div>

      <section className="rounded border border-border-subtle bg-surface-panel p-4">
        <ul className="space-y-3">
          {themes.map(({ manifest }) => (
            <li key={manifest.key} className="flex items-center justify-between gap-4 text-sm text-text-secondary">
              <div>
                <span className="font-medium text-text-primary">{manifest.name}</span>{" "}
                <span className="text-text-tertiary">
                  ({manifest.key}, v{manifest.version})
                </span>
                {manifest.key === activeThemeKey && (
                  <span className="ml-2 rounded bg-surface-elevated px-2 py-0.5 text-xs font-medium text-text-secondary">Ativo</span>
                )}
              </div>
              <ActivateThemeButton themeKey={manifest.key} disabled={manifest.key === activeThemeKey} />
            </li>
          ))}
          {themes.length === 0 && <li className="text-sm text-text-tertiary">Nenhum tema instalado.</li>}
        </ul>
      </section>
    </div>
  );
}
