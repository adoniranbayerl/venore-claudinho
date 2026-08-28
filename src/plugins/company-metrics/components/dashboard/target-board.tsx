import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MetricUnit, TargetRollup } from "@/plugins/company-metrics/contracts/types";
import { formatMetricValue } from "@/plugins/company-metrics/shared/format";

// Painel de uma meta: número principal, barra realizado/risco contra a meta, status.
// Compartilhado entre a aba Metas do admin, a visualização interativa (Fase 4) e a TV (Fase 5).
// Cor só via token shadcn.

const STATUS_LABEL: Record<TargetRollup["status"], string> = {
  met: "Meta batida",
  on_track: "No ritmo",
  below: "Abaixo do ritmo",
};

const STATUS_TONE: Record<TargetRollup["status"], string> = {
  met: "text-primary",
  on_track: "text-warning",
  below: "text-destructive",
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value * 100));
}

export function TargetBoard({
  label,
  unit,
  rollup,
  size = "md",
}: {
  label: string;
  unit: MetricUnit;
  rollup: TargetRollup;
  size?: "md" | "lg";
}) {
  const denom = Math.max(rollup.targetValue, rollup.optimistic, rollup.headline) || 1;
  const realizedPct = clampPercent(rollup.headline / denom);
  const atRiskPct = clampPercent((rollup.optimistic - rollup.headline) / denom);
  const targetMarkPct = clampPercent(rollup.targetValue / denom);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", size === "lg" && "p-6")}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={cn("font-semibold text-foreground", size === "lg" ? "text-lg" : "text-sm")}>{label}</p>
        <Badge variant="outline" className={STATUS_TONE[rollup.status]}>
          {STATUS_LABEL[rollup.status]}
        </Badge>
      </div>

      <div className={cn("mt-2 flex items-baseline gap-2 tabular-nums", size === "lg" ? "text-4xl" : "text-2xl")}>
        <span className="font-semibold text-foreground">{formatMetricValue(rollup.headline, unit)}</span>
        <span className={cn("text-muted-foreground", size === "lg" ? "text-base" : "text-xs")}>
          / {formatMetricValue(rollup.targetValue, unit)}
        </span>
      </div>

      <div className="relative mt-3 h-7 overflow-hidden rounded-md border border-border bg-muted">
        <div className="absolute inset-y-0 left-0 flex">
          <div className="h-full bg-primary" style={{ width: `${realizedPct}%` }} />
          <div className="h-full bg-warning/55" style={{ width: `${atRiskPct}%` }} />
        </div>
        <div className="absolute inset-y-0 w-0.5 bg-foreground" style={{ left: `${targetMarkPct}%` }} />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Realizado <span className="tabular-nums text-foreground">{formatMetricValue(rollup.headline, unit)}</span>
        </span>
        {rollup.atRisk !== 0 && (
          <span>
            Em risco <span className="tabular-nums text-foreground">{formatMetricValue(rollup.atRisk, unit)}</span>
          </span>
        )}
        <span>
          {rollup.gap > 0 ? "Falta" : "Excedente"}{" "}
          <span className="tabular-nums text-foreground">{formatMetricValue(Math.abs(rollup.gap), unit)}</span>
        </span>
        <span className="tabular-nums">{Math.round(rollup.completion * 100)}%</span>
      </div>
    </div>
  );
}
