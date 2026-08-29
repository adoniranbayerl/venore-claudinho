"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatRelativeTime, METRIC_UNIT_LABELS } from "@/plugins/company-metrics/shared/format";
import type { MetricUnit } from "@/plugins/company-metrics/contracts/types";
import { upsertMetricValueAction, type CompanyMetricsActionState } from "./actions";

const initialState: CompanyMetricsActionState = { error: null };

// Uma linha da grade de lançamento: label da métrica + input do valor do período de referência.
// Vazio + salvar = limpa o lançamento daquele período.
export function MetricValueRow({
  definitionId,
  label,
  unit,
  periodLabel,
  periodDate,
  currentValue,
  currentNote,
  lastUpdatedAt,
}: {
  definitionId: string;
  label: string;
  unit: MetricUnit;
  periodLabel: string;
  periodDate: string;
  currentValue: number | null;
  currentNote: string | null;
  lastUpdatedAt: Date | string | null;
}) {
  const [state, formAction, pending] = useActionState(upsertMetricValueAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Valor lançado." });

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 border-b border-border px-3 py-3 last:border-b-0"
      key={`${definitionId}:${periodDate}:${currentValue ?? "empty"}`}
    >
      <input type="hidden" name="definitionId" value={definitionId} />
      <input type="hidden" name="periodDate" value={periodDate} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/56">
          {METRIC_UNIT_LABELS[unit]} · {periodLabel} · última atualização {formatRelativeTime(lastUpdatedAt)}
        </p>
      </div>

      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Valor
        <Input
          name="value"
          inputMode="decimal"
          defaultValue={currentValue ?? ""}
          placeholder="—"
          className="w-32 tabular-nums"
        />
      </label>

      <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
        Nota (opcional)
        <Input name="note" defaultValue={currentNote ?? ""} placeholder="contexto do número" />
      </label>

      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        Salvar
      </Button>
    </form>
  );
}
