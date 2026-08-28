import type { ResolvedTvScreen } from "@/plugins/company-metrics/contracts/types";
import { MetricTrend } from "@/plugins/company-metrics/components/dashboard/metric-trend";
import { TargetBoard } from "@/plugins/company-metrics/components/dashboard/target-board";
import { formatBucketLabel } from "@/plugins/company-metrics/shared/format";

const STATUS_TONE = { met: "text-primary", on_track: "text-warning", below: "text-destructive" } as const;
const STATUS_LABEL = { met: "batida", on_track: "no ritmo", below: "abaixo" } as const;

export function TvScreenContent({ screen }: { screen: ResolvedTvScreen }) {
  if (screen.kind === "overview") {
    return (
      <div className="flex h-full w-full flex-col gap-8 p-16">
        <h1 className="text-5xl font-semibold text-foreground">Métricas Internas — panorama</h1>
        <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-6">
          {screen.sectors.map((sector) => (
            <div key={sector.name} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8">
              <p className="text-3xl font-semibold text-foreground">{sector.name}</p>
              {sector.targetCount === 0 ? (
                <p className="text-2xl text-muted-foreground/56">Sem metas</p>
              ) : (
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-2xl">
                  {(["met", "on_track", "below"] as const).map((status) =>
                    sector.statusCounts[status] > 0 ? (
                      <span key={status} className={STATUS_TONE[status]}>
                        {sector.statusCounts[status]} {STATUS_LABEL[status]}
                      </span>
                    ) : null,
                  )}
                  {sector.averageCompletion !== null && (
                    <span className="ml-auto tabular-nums text-foreground">
                      {Math.round(sector.averageCompletion * 100)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen.kind === "sector_kpis") {
    return (
      <div className="flex h-full w-full flex-col gap-8 p-16">
        <h1 className="text-5xl font-semibold text-foreground">{screen.sectorName}</h1>
        {screen.metrics.length === 0 ? (
          <p className="text-3xl text-muted-foreground/56">Nenhuma métrica cadastrada.</p>
        ) : (
          <div className="grid flex-1 auto-rows-fr grid-cols-3 gap-6 [&_p]:text-2xl [&_svg]:h-24">
            {screen.metrics.slice(0, 9).map((series) => (
              <MetricTrend
                key={series.label}
                label={series.label}
                unit={series.unit}
                direction={series.direction}
                granularity={series.granularity}
                points={series.points}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // target_board
  return (
    <div className="flex h-full w-full flex-col justify-center gap-6 p-24">
      <TargetBoard label={screen.label} unit={screen.unit} rollup={screen.rollup} size="lg" />
      <p className="text-center text-2xl text-muted-foreground/56">
        {formatBucketLabel(screen.periodStart, "daily")} – {formatBucketLabel(screen.periodEnd, "daily")}
      </p>
    </div>
  );
}
