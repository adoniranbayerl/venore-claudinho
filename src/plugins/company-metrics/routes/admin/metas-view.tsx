import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { TargetBoard } from "@/plugins/company-metrics/components/dashboard/target-board";
import { formatBucketLabel } from "@/plugins/company-metrics/shared/format";
import type {
  MetricDefinitionRecord,
  MetricUnit,
  TargetInputRecord,
  TargetRollupView,
} from "@/plugins/company-metrics/contracts/types";
import { DeleteTargetButton } from "./delete-target-button";
import { CreateTargetDialog, EditTargetDialog } from "./target-dialogs";
import { ScopeControls } from "./scope-controls";

export function MetasView({
  sectors,
  activeSectorId,
  activeSectorName,
  rollups,
  inputsByTarget,
  definitions,
  canConfigure,
}: {
  sectors: { id: string; name: string }[];
  activeSectorId: string | undefined;
  activeSectorName: string | undefined;
  rollups: TargetRollupView[];
  inputsByTarget: Map<string, TargetInputRecord[]>;
  definitions: MetricDefinitionRecord[];
  canConfigure: boolean;
}) {
  if (!activeSectorId) {
    return <EmptyState title="Nenhum setor" description="Crie um setor e cadastre métricas para definir metas." />;
  }

  const definitionOptions = definitions
    .filter((definition) => definition.archivedAt === null)
    .map((definition) => ({ id: definition.id, label: definition.label }));
  const unitByDefinition = new Map<string, MetricUnit>(definitions.map((definition) => [definition.id, definition.unit]));

  function boardUnit(view: TargetRollupView): MetricUnit {
    const realizedLine = view.lines.find((line) => line.classification === "realized");
    return (realizedLine && unitByDefinition.get(realizedLine.definitionId)) ?? "count";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ScopeControls sectors={sectors} activeSectorId={activeSectorId} />
        {canConfigure && <CreateTargetDialog sectorId={activeSectorId} definitions={definitionOptions} />}
      </div>

      {rollups.length === 0 ? (
        <EmptyState
          title={`Nenhuma meta em ${activeSectorName ?? "este setor"}`}
          description={
            canConfigure
              ? "Defina a primeira meta e escolha quais métricas somam contra ela."
              : "As metas deste setor ainda não foram definidas."
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rollups.map((view) => (
            <li key={view.target.id} className="space-y-2">
              <TargetBoard label={view.target.label} unit={boardUnit(view)} rollup={view.rollup} />
              <div className="flex flex-wrap items-center gap-2 px-1 text-xs text-muted-foreground">
                <Badge variant="secondary">
                  {formatBucketLabel(view.target.periodStart, "daily")} – {formatBucketLabel(view.target.periodEnd, "daily")}
                </Badge>
                <span>{view.lines.length} métrica(s) na composição</span>
                {canConfigure && (
                  <span className="ml-auto flex gap-1">
                    <EditTargetDialog
                      target={view.target}
                      inputs={inputsByTarget.get(view.target.id) ?? []}
                      definitions={definitionOptions}
                    />
                    <DeleteTargetButton targetId={view.target.id} />
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
