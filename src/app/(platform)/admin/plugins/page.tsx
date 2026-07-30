import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";
import { registerPlugins } from "@/platform/plugin-engine/register-plugins";
import { EmptyState } from "@/components/empty-state";
import { Blocks } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  invalid: "Manifesto inválido",
  incompatible: "Incompatível com o core",
  dependency_missing: "Dependência ausente",
  cycle: "Dependência cíclica",
};

const STATUS_CLASSNAME: Record<string, string> = {
  active: "bg-accent/14 text-foreground",
  invalid: "bg-destructive/14 text-destructive",
  incompatible: "bg-destructive/14 text-destructive",
  dependency_missing: "bg-warning-soft text-warning",
  cycle: "bg-warning-soft text-warning",
};

export default async function PluginsAdminPage() {
  const gate = await getAdminPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para ver os plugins instalados.</p>
      </div>
    );
  }

  const report = await registerPlugins();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Plugins</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plugins instalados em código (src/plugins/registry.ts), com o resultado da validação de manifesto,
          compatibilidade e dependências feita no registro.
        </p>
      </div>

      {report.entries.length === 0 ? (
        <EmptyState
          icon={<Blocks className="size-8" strokeWidth={1.5} />}
          title="Nenhum plugin instalado"
          description="Plugins são instalados em código — adicione uma entrada em src/plugins/registry.ts para começar."
        />
      ) : (
        <ul className="space-y-3">
          {report.entries.map((entry) => (
            <li key={entry.key} className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{entry.manifest?.name ?? entry.key}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.key}
                    {entry.manifest?.version && <> · v{entry.manifest.version}</>}
                  </p>
                  {entry.manifest?.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{entry.manifest.description}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASSNAME[entry.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {STATUS_LABEL[entry.status] ?? entry.status}
                </span>
              </div>
              {entry.errors.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-border pt-3">
                  {entry.errors.map((error, index) => (
                    <li key={index} className="text-xs text-destructive">
                      {error}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
