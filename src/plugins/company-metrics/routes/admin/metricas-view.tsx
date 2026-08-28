import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  METRIC_AGGREGATION_LABELS,
  METRIC_DIRECTION_LABELS,
  METRIC_GRANULARITY_LABELS,
  METRIC_UNIT_LABELS,
} from "@/plugins/company-metrics/shared/format";
import type { MetricDefinitionRecord, SectorGroupRecord } from "@/plugins/company-metrics/contracts/types";
import { ArchiveMetricDefinitionButton } from "./archive-metric-definition-button";
import { CreateMetricDefinitionDialog, EditMetricDefinitionDialog } from "./metric-definition-dialogs";
import { ScopeControls } from "./scope-controls";

export function MetricasView({
  sectors,
  activeSectorId,
  activeSectorName,
  definitions,
  groups,
  canConfigure,
}: {
  sectors: { id: string; name: string }[];
  activeSectorId: string | undefined;
  activeSectorName: string | undefined;
  definitions: MetricDefinitionRecord[];
  groups: SectorGroupRecord[];
  canConfigure: boolean;
}) {
  if (!activeSectorId) {
    return <EmptyState title="Nenhum setor" description="Crie um setor na aba Setores para cadastrar métricas." />;
  }

  const groupOptions = groups.map((group) => ({ id: group.id, label: group.label }));
  const groupLabelById = new Map(groups.map((group) => [group.id, group.label]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ScopeControls sectors={sectors} activeSectorId={activeSectorId} />
        {canConfigure && <CreateMetricDefinitionDialog sectorId={activeSectorId} groups={groupOptions} />}
      </div>

      {definitions.length === 0 ? (
        <EmptyState
          title={`Nenhuma métrica em ${activeSectorName ?? "este setor"}`}
          description={
            canConfigure
              ? "Cadastre as métricas que este setor acompanha (matriculados, receita, leads…)."
              : "As métricas deste setor ainda não foram cadastradas."
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {definitions.map((definition) => {
            const archived = definition.archivedAt !== null;
            return (
              <li key={definition.id} className="flex flex-wrap items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{definition.label}</span>
                    {definition.groupId && groupLabelById.has(definition.groupId) && (
                      <Badge variant="secondary">{groupLabelById.get(definition.groupId)}</Badge>
                    )}
                    {archived && <Badge variant="outline">Arquivada</Badge>}
                  </div>
                  {definition.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{definition.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground/56">
                    {METRIC_UNIT_LABELS[definition.unit]} · {METRIC_GRANULARITY_LABELS[definition.granularity]} ·{" "}
                    {METRIC_AGGREGATION_LABELS[definition.aggregation]} · {METRIC_DIRECTION_LABELS[definition.direction]}
                  </p>
                </div>
                {canConfigure && (
                  <div className="flex flex-wrap gap-2">
                    <EditMetricDefinitionDialog definition={definition} groups={groupOptions} />
                    <ArchiveMetricDefinitionButton definitionId={definition.id} archived={archived} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
