import { EmptyState } from "@/components/empty-state";
import { formatBucketLabel } from "@/plugins/company-metrics/shared/format";
import { bucketStart } from "@/plugins/company-metrics/shared/period";
import type { MetricDefinitionRecord, MetricValueRecord } from "@/plugins/company-metrics/contracts/types";
import { MetricValueRow } from "./metric-value-row";
import { ScopeControls } from "./scope-controls";

export function LancamentosView({
  sectors,
  activeSectorId,
  activeSectorName,
  referenceDate,
  definitions,
  values,
  canContribute,
}: {
  sectors: { id: string; name: string }[];
  activeSectorId: string | undefined;
  activeSectorName: string | undefined;
  referenceDate: string;
  definitions: MetricDefinitionRecord[];
  values: MetricValueRecord[];
  canContribute: boolean;
}) {
  if (!activeSectorId) {
    return <EmptyState title="Nenhum setor" description="Crie um setor e cadastre métricas para lançar valores." />;
  }

  const valueByKey = new Map(values.map((value) => [`${value.definitionId}:${value.periodStart}`, value]));

  return (
    <div className="space-y-4">
      <ScopeControls sectors={sectors} activeSectorId={activeSectorId} showDate activeDate={referenceDate} />

      {!canContribute ? (
        <EmptyState
          title="Sem permissão para lançar"
          description={`Você não é editor de ${activeSectorName ?? "este setor"}. Peça acesso a um administrador do setor.`}
        />
      ) : definitions.length === 0 ? (
        <EmptyState
          title={`Nenhuma métrica em ${activeSectorName ?? "este setor"}`}
          description="Cadastre métricas na aba Métricas para começar a lançar valores."
        />
      ) : (
        <div className="rounded-xl border border-border">
          <p className="border-b border-border px-3 py-2 text-xs text-muted-foreground/56">
            Cada métrica lança no período que contém a data de referência, conforme a cadência dela. Deixe o valor vazio e
            salve para limpar o lançamento.
          </p>
          {definitions.map((definition) => {
            const periodStart = bucketStart(referenceDate, definition.granularity);
            const existing = valueByKey.get(`${definition.id}:${periodStart}`) ?? null;
            return (
              <MetricValueRow
                key={definition.id}
                definitionId={definition.id}
                label={definition.label}
                unit={definition.unit}
                periodLabel={formatBucketLabel(periodStart, definition.granularity)}
                periodDate={referenceDate}
                currentValue={existing ? existing.value : null}
                currentNote={existing ? existing.note : null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
