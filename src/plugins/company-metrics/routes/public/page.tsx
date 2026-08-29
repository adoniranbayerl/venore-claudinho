import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  getMetricsOverview,
  getSectorDashboard,
  type SectorDashboard,
  type SectorOverview,
} from "@/plugins/company-metrics";
import { ChartTokens } from "@/plugins/company-metrics/components/dashboard/chart-tokens";
import { MetricTrend } from "@/plugins/company-metrics/components/dashboard/metric-trend";
import { TargetBoard } from "@/plugins/company-metrics/components/dashboard/target-board";
import { formatBucketLabel, formatRelativeTime } from "@/plugins/company-metrics/shared/format";
import type { MetricUnit } from "@/plugins/company-metrics/contracts/types";
import { WindowSelect } from "./window-select";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const STATUS_TONE = { met: "text-primary", on_track: "text-warning", below: "text-destructive" } as const;

export default async function CompanyMetricsPublicPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const overviewResult = await getMetricsOverview();

  // Sem permissão de leitura (ou plugin desativado) — não revela a existência da rota.
  if (!overviewResult.success) {
    notFound();
  }

  const sectors = overviewResult.data.sectors;
  const requestedSector = first(params.sector);
  const activeSector = requestedSector ? sectors.find((entry) => entry.sector.id === requestedSector) : undefined;

  if (requestedSector && !activeSector) {
    // pediu um setor que não existe / fora do escopo
    notFound();
  }

  if (activeSector) {
    const windowMonths = Number(first(params.window)) || 6;
    const dashboardResult = await getSectorDashboard({ sectorId: activeSector.sector.id, windowMonths });
    if (!dashboardResult.success) {
      notFound();
    }
    return <SectorDashboardView data={dashboardResult.data} />;
  }

  return (
    <div className="space-y-6">
      <ChartTokens />
      <header>
        <h1 className="text-xl font-semibold text-foreground">Métricas Internas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Andamento das metas por setor. Toque num setor para ver as métricas e a evolução.
        </p>
      </header>

      {sectors.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted p-8 text-center text-sm text-muted-foreground">
          Nenhum setor disponível para você ainda.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sectors.map((entry) => (
            <li key={entry.sector.id}>
              <Link
                href={`/metricas?sector=${entry.sector.id}`}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 ui-motion-base hover:border-ring"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{entry.sector.name}</span>
                  <ChevronRight className="size-4 text-muted-foreground/56" />
                </div>
                <SectorMiniSummary entry={entry} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectorMiniSummary({ entry }: { entry: SectorOverview }) {
  if (entry.targetCount === 0) {
    return <p className="text-xs text-muted-foreground/56">Sem metas definidas.</p>;
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {(["met", "on_track", "below"] as const).map((status) =>
          entry.statusCounts[status] > 0 ? (
            <span key={status} className={STATUS_TONE[status]}>
              {entry.statusCounts[status]}{" "}
              {status === "met" ? "batida(s)" : status === "on_track" ? "no ritmo" : "abaixo"}
            </span>
          ) : null,
        )}
      </div>
      {entry.averageCompletion !== null && (
        <div className="flex items-center gap-2">
          <Progress value={Math.min(100, Math.round(entry.averageCompletion * 100))} className="h-1.5" />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {Math.round(entry.averageCompletion * 100)}%
          </span>
        </div>
      )}
      <p className="text-xs text-muted-foreground/56">Última atualização {formatRelativeTime(entry.lastUpdatedAt)}</p>
    </div>
  );
}

function SectorDashboardView({ data }: { data: SectorDashboard }) {
  const unitByDefinition = new Map<string, MetricUnit>(data.metrics.map((series) => [series.definition.id, series.definition.unit]));
  function boardUnit(view: SectorDashboard["targets"][number]): MetricUnit {
    const realized = view.lines.find((line) => line.classification === "realized");
    return (realized && unitByDefinition.get(realized.definitionId)) ?? "count";
  }

  return (
    <div className="space-y-6">
      <ChartTokens />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/metricas" className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Todos os setores
          </Link>
          <h1 className="text-xl font-semibold text-foreground">{data.sector.name}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground/56">Última atualização {formatRelativeTime(data.lastUpdatedAt)}</p>
        </div>
        <WindowSelect value={data.windowMonths} />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Metas</h2>
        {data.targets.length === 0 ? (
          <p className="text-sm text-muted-foreground/56">Nenhuma meta definida para este setor.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {data.targets.map((view) => (
              <li key={view.target.id} className="space-y-1">
                <TargetBoard label={view.target.label} unit={boardUnit(view)} rollup={view.rollup} />
                <p className="px-1 text-xs text-muted-foreground/56">
                  {formatBucketLabel(view.target.periodStart, "daily")} – {formatBucketLabel(view.target.periodEnd, "daily")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Métricas — evolução</h2>
        {data.metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground/56">Nenhuma métrica cadastrada.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.metrics.map((series, index) => (
              <li key={series.definition.id}>
                <MetricTrend
                  label={series.definition.label}
                  unit={series.definition.unit}
                  direction={series.definition.direction}
                  granularity={series.definition.granularity}
                  points={series.points}
                  colorIndex={index}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
