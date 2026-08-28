import type { MetricDirection, MetricUnit } from "@/plugins/company-metrics/contracts/types";
import { formatBucketLabel, formatMetricValue, METRIC_UNIT_LABELS } from "@/plugins/company-metrics/shared/format";

// Sparkline em SVG inline — sem biblioteca, tema-aware via currentColor/tokens. Endpoint
// enfatizado; área sutil sob a linha. Reusada pela visualização interativa e pela TV.

type Point = { periodStart: string; value: number };

const W = 240;
const H = 56;
const PAD = 4;

export function MetricTrend({
  label,
  unit,
  direction,
  granularity,
  points,
}: {
  label: string;
  unit: MetricUnit;
  direction: MetricDirection;
  granularity: string;
  points: Point[];
}) {
  const values = points.map((point) => point.value);
  const last = values.length > 0 ? values[values.length - 1] : null;
  const prev = values.length > 1 ? values[values.length - 2] : null;
  const delta = last !== null && prev !== null ? last - prev : null;
  const deltaGood = delta === null ? null : direction === "up_good" ? delta >= 0 : delta <= 0;

  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 1;
  const span = max - min || 1;

  const coords = points.map((point, index) => {
    const x = PAD + (points.length <= 1 ? 0 : (index / (points.length - 1)) * (W - PAD * 2));
    const y = H - PAD - ((point.value - min) / span) * (H - PAD * 2);
    return { x, y };
  });

  const linePath = coords.map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x.toFixed(1)},${coord.y.toFixed(1)}`).join(" ");
  const areaPath =
    coords.length > 0
      ? `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${H - PAD} L${coords[0].x.toFixed(1)},${H - PAD} Z`
      : "";

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-sm font-medium text-foreground">{label}</p>
        {last !== null && (
          <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
            {formatMetricValue(last, unit)}
          </span>
        )}
      </div>

      {coords.length >= 2 ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-14 w-full text-primary" preserveAspectRatio="none" aria-hidden="true">
          <path d={areaPath} className="fill-primary/12" />
          <path d={linePath} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2.5" fill="currentColor" />
        </svg>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground/56">Sem histórico suficiente para o gráfico.</p>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground/56">
        <span>{METRIC_UNIT_LABELS[unit]}</span>
        {points.length > 0 && <span>{formatBucketLabel(points[0].periodStart, granularity)} → hoje</span>}
        {delta !== null && (
          <span className={deltaGood ? "text-primary" : "text-destructive"}>
            {delta >= 0 ? "▲" : "▼"} {formatMetricValue(Math.abs(delta), unit)}
          </span>
        )}
      </div>
    </div>
  );
}
