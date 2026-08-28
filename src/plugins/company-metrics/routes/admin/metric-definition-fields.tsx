import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  METRIC_AGGREGATION_LABELS,
  METRIC_DIRECTION_LABELS,
  METRIC_GRANULARITY_LABELS,
  METRIC_UNIT_LABELS,
} from "@/plugins/company-metrics/shared/format";
import {
  METRIC_AGGREGATIONS,
  METRIC_DEFINITION_GRANULARITIES,
  METRIC_DIRECTIONS,
  METRIC_UNITS,
} from "@/plugins/company-metrics/contracts/types";

type GroupOption = { id: string; label: string };

// Campos compartilhados entre criar e editar métrica. Na edição, `granularity` é fixo (mudá-la
// reorganizaria os buckets já lançados) — a prop `lockGranularity` esconde o campo.
export function MetricDefinitionFields({
  groups,
  defaultLabel = "",
  defaultDescription = "",
  defaultGroupId = "",
  defaultUnit = "count",
  defaultAggregation = "sum",
  defaultGranularity = "monthly",
  defaultDirection = "up_good",
  lockGranularity = false,
}: {
  groups: GroupOption[];
  defaultLabel?: string;
  defaultDescription?: string;
  defaultGroupId?: string;
  defaultUnit?: string;
  defaultAggregation?: string;
  defaultGranularity?: string;
  defaultDirection?: string;
  lockGranularity?: boolean;
}) {
  return (
    <>
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Nome da métrica
        <Input name="label" defaultValue={defaultLabel} placeholder="ex.: Alunos matriculados" required />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Descrição (opcional)
        <Textarea name="description" defaultValue={defaultDescription} rows={2} placeholder="O que este número representa" />
      </label>

      {groups.length > 0 && (
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Grupo (opcional)
          <Select name="groupId" defaultValue={defaultGroupId || "none"}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem grupo</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Unidade
          <Select name="unit" defaultValue={defaultUnit}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRIC_UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {METRIC_UNIT_LABELS[unit]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Direção
          <Select name="direction" defaultValue={defaultDirection}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRIC_DIRECTIONS.map((direction) => (
                <SelectItem key={direction} value={direction}>
                  {METRIC_DIRECTION_LABELS[direction]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Consolidação
          <Select name="aggregation" defaultValue={defaultAggregation}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRIC_AGGREGATIONS.map((aggregation) => (
                <SelectItem key={aggregation} value={aggregation}>
                  {METRIC_AGGREGATION_LABELS[aggregation]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {lockGranularity ? (
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            Cadência
            <span className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
              {METRIC_GRANULARITY_LABELS[defaultGranularity]} (fixa)
            </span>
          </div>
        ) : (
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Cadência
            <Select name="granularity" defaultValue={defaultGranularity}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_DEFINITION_GRANULARITIES.map((granularity) => (
                  <SelectItem key={granularity} value={granularity}>
                    {METRIC_GRANULARITY_LABELS[granularity]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}
      </div>
    </>
  );
}
