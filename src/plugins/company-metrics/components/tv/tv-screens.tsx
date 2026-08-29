import type { ResolvedTvScreen, TargetBoardLite } from "@/plugins/company-metrics/contracts/types";
import { MetricTrend } from "@/plugins/company-metrics/components/dashboard/metric-trend";
import { TargetBoard } from "@/plugins/company-metrics/components/dashboard/target-board";
import { formatBucketLabel, formatMetricValue } from "@/plugins/company-metrics/shared/format";

const STATUS_TONE = { met: "text-primary", on_track: "text-warning", below: "text-destructive" } as const;
const STATUS_LABEL = { met: "batida", on_track: "no ritmo", below: "abaixo" } as const;

function periodLabel(board: TargetBoardLite): string {
  return `${formatBucketLabel(board.periodStart, "daily")} – ${formatBucketLabel(board.periodEnd, "daily")}`;
}

export function TvScreenContent({ screen }: { screen: ResolvedTvScreen }) {
  if (screen.kind === "overview") {
    return (
      <div className="flex h-full w-full flex-col gap-8 p-16">
        <h1 className="text-5xl font-semibold text-foreground">Métricas Internas — panorama</h1>
        <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-6">
          {screen.sectors.map((sector, index) => (
            <div
              key={sector.name}
              className="flex flex-col justify-between rounded-2xl border-l-8 border-border bg-card p-8"
              style={{ borderLeftColor: `var(--cm-chart-${(index % 8) + 1})` }}
            >
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
            {screen.metrics.slice(0, 9).map((series, index) => (
              <MetricTrend
                key={series.label}
                label={series.label}
                unit={series.unit}
                direction={series.direction}
                granularity={series.granularity}
                points={series.points}
                colorIndex={index}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (screen.kind === "sector_targets") {
    return (
      <div className="flex h-full w-full flex-col gap-8 p-16">
        <h1 className="text-5xl font-semibold text-foreground">{screen.sectorName} — metas</h1>
        {screen.targets.length === 0 ? (
          <p className="text-3xl text-muted-foreground/56">Nenhuma meta definida.</p>
        ) : (
          <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-6">
            {screen.targets.slice(0, 6).map((board) => (
              <TargetBoard key={board.label} label={board.label} unit={board.unit} rollup={board.rollup} size="lg" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (screen.kind === "group_summary") {
    return (
      <div className="flex h-full w-full flex-col gap-8 p-16">
        <h1 className="text-5xl font-semibold text-foreground">{screen.sectorName} — por instituição</h1>
        <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-6">
          {screen.groups.map((group, index) => (
            <div
              key={group.label}
              className="flex flex-col gap-4 rounded-2xl border-l-8 border-border bg-card p-8"
              style={{ borderLeftColor: `var(--cm-chart-${(index % 8) + 1})` }}
            >
              <p className="text-3xl font-semibold text-foreground">{group.label}</p>
              {group.headline ? (
                <>
                  <div className="flex items-baseline gap-3 tabular-nums">
                    <span className="text-6xl font-semibold text-foreground">
                      {formatMetricValue(group.headline.rollup.headline, group.headline.unit)}
                    </span>
                    <span className="text-2xl text-muted-foreground">
                      / {formatMetricValue(group.headline.rollup.targetValue, group.headline.unit)}
                    </span>
                    <span className={`ml-auto text-3xl ${STATUS_TONE[group.headline.rollup.status]}`}>
                      {Math.round(group.headline.rollup.completion * 100)}%
                    </span>
                  </div>
                  <div className="relative h-6 overflow-hidden rounded-md border border-border bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary"
                      style={{ width: `${Math.min(100, Math.round(group.headline.rollup.completion * 100))}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-2xl text-muted-foreground/56">Sem meta agregada</p>
              )}
              <p className="text-xl text-muted-foreground/56">{group.targetCount} meta(s)</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen.kind === "target_board") {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-6 p-24">
        <TargetBoard label={screen.label} unit={screen.unit} rollup={screen.rollup} size="lg" />
        <p className="text-center text-2xl text-muted-foreground/56">{periodLabel(screen)}</p>
      </div>
    );
  }

  // metric_spotlight
  return (
    <div className="flex h-full w-full flex-col justify-center gap-8 p-24">
      <p className="text-4xl text-muted-foreground">{screen.label}</p>
      <p className="text-[10rem] font-semibold leading-none tabular-nums text-foreground">
        {screen.current !== null ? formatMetricValue(screen.current, screen.unit) : "—"}
      </p>
      <div className="[&_p]:text-3xl [&_svg]:h-40">
        <MetricTrend
          label="Evolução"
          unit={screen.unit}
          direction={screen.direction}
          granularity={screen.granularity}
          points={screen.points}
          colorIndex={0}
        />
      </div>
      {screen.points.length > 0 && (
        <p className="text-2xl text-muted-foreground/56">
          desde {formatBucketLabel(screen.points[0].periodStart, screen.granularity)}
        </p>
      )}
    </div>
  );
}
