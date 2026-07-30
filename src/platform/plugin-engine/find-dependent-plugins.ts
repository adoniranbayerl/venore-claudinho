import type { PluginRegistrationReport } from "./types";

export type DependentPluginRef = { key: string; name: string };

// Só conta como dependente quem está de fato ativo hoje — um plugin já desabilitado ou bloqueado
// por outro motivo não é razão pra bloquear a desabilitação deste (docs/venore-docks.md — "não é
// possível desabilitar plugin do qual outro plugin habilitado depende").
export function findEnabledDependents(pluginKey: string, report: PluginRegistrationReport): DependentPluginRef[] {
  return report.entries
    .filter(
      (entry) =>
        entry.status === "active" &&
        entry.manifest?.dependencies?.some((dependency) => dependency.type === "required" && dependency.pluginKey === pluginKey),
    )
    .map((entry) => ({ key: entry.key, name: entry.manifest?.name ?? entry.key }));
}
