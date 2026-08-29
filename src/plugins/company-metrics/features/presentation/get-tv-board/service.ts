import { getSetting } from "@/contexts/settings";
import type {
  MetricUnit,
  ResolvedTvScreen,
  TargetBoardLite,
  TargetRollupView,
  TvBoardView,
} from "../../../contracts/types";
import { normalizeTimeZone } from "../../../shared/settings";
import { getMetricsOverview } from "../../dashboard/get-metrics-overview/service";
import { getSectorDashboard } from "../../dashboard/get-sector-dashboard/service";
import { getTargetRollups } from "../../targets/get-target-rollups/service";
import { findBoardByToken, findScreensForBoards } from "../shared/store";
import {
  findDefinitionById,
  findRecentValues,
  findSectorById,
  findSectorDefinitions,
  findSectorGroups,
  findTargetById,
} from "./store";
import type { GetTvBoardResult } from "./types";

const SPOTLIGHT_POINTS = 11;

function boardLiteFrom(view: TargetRollupView, unitByDefinition: Map<string, MetricUnit>): TargetBoardLite {
  const realized = view.lines.find((line) => line.classification === "realized");
  return {
    label: view.target.label,
    unit: (realized && unitByDefinition.get(realized.definitionId)) ?? "count",
    periodStart: view.target.periodStart,
    periodEnd: view.target.periodEnd,
    rollup: view.rollup,
  };
}

// SEM authorizeActor — acesso por token na URL (mesma regra de broadcast/enrollment). Resolve
// cada tela do board no view model pronto para o telão. Telas cujo setor/meta/métrica foi apagado
// são puladas (referência null).
export async function getTvBoard(token: string): Promise<GetTvBoardResult> {
  const board = await findBoardByToken(token);
  if (!board) {
    return { success: false, error: { code: "company-metrics.get-tv-board.not_found", message: "Painel não encontrado." } };
  }

  const screens = await findScreensForBoards([board.id]);
  const tzSetting = await getSetting({ key: "company-metrics.timezone" });
  const timeZone = normalizeTimeZone(tzSetting.success ? tzSetting.data?.value : undefined);

  const resolved: ResolvedTvScreen[] = [];

  for (const screen of screens) {
    if (screen.kind === "overview") {
      const overview = await getMetricsOverview({});
      resolved.push({
        id: screen.id,
        kind: "overview",
        dwellSeconds: screen.dwellSeconds,
        sectors: (overview.success ? overview.data.sectors : []).map((entry) => ({
          name: entry.sector.name,
          targetCount: entry.targetCount,
          statusCounts: entry.statusCounts,
          averageCompletion: entry.averageCompletion,
        })),
      });
      continue;
    }

    if (screen.kind === "sector_kpis") {
      if (!screen.sectorId) continue;
      const dashboard = await getSectorDashboard({ sectorId: screen.sectorId, windowMonths: 6, timeZone });
      if (!dashboard.success) continue;
      resolved.push({
        id: screen.id,
        kind: "sector_kpis",
        dwellSeconds: screen.dwellSeconds,
        sectorName: dashboard.data.sector.name,
        metrics: dashboard.data.metrics.map((series) => ({
          label: series.definition.label,
          unit: series.definition.unit,
          direction: series.definition.direction,
          granularity: series.definition.granularity,
          points: series.points,
        })),
      });
      continue;
    }

    if (screen.kind === "sector_targets" || screen.kind === "group_summary") {
      if (!screen.sectorId) continue;
      const sector = await findSectorById(screen.sectorId);
      if (!sector) continue;
      const [rollups, definitions] = await Promise.all([
        getTargetRollups(screen.sectorId),
        findSectorDefinitions(screen.sectorId),
      ]);
      if (!rollups.success) continue;
      const unitByDefinition = new Map(definitions.map((definition) => [definition.id, definition.unit]));

      if (screen.kind === "sector_targets") {
        resolved.push({
          id: screen.id,
          kind: "sector_targets",
          dwellSeconds: screen.dwellSeconds,
          sectorName: sector.name,
          targets: rollups.data.map((view) => boardLiteFrom(view, unitByDefinition)),
        });
        continue;
      }

      const groups = await findSectorGroups(screen.sectorId);
      resolved.push({
        id: screen.id,
        kind: "group_summary",
        dwellSeconds: screen.dwellSeconds,
        sectorName: sector.name,
        groups: groups.map((group) => {
          const groupViews = rollups.data.filter((view) => view.target.groupId === group.id);
          return {
            label: group.label,
            headline: groupViews.length > 0 ? boardLiteFrom(groupViews[0], unitByDefinition) : null,
            targetCount: groupViews.length,
          };
        }),
      });
      continue;
    }

    if (screen.kind === "metric_spotlight") {
      if (!screen.definitionId) continue;
      const definition = await findDefinitionById(screen.definitionId);
      if (!definition || definition.archivedAt) continue;
      const points = await findRecentValues(screen.definitionId, SPOTLIGHT_POINTS);
      resolved.push({
        id: screen.id,
        kind: "metric_spotlight",
        dwellSeconds: screen.dwellSeconds,
        label: definition.label,
        unit: definition.unit,
        direction: definition.direction,
        granularity: definition.granularity,
        points,
        current: points.length > 0 ? points[points.length - 1].value : null,
      });
      continue;
    }

    // target_board
    if (!screen.targetId) continue;
    const target = await findTargetById(screen.targetId);
    if (!target) continue;
    const sector = await findSectorById(target.sectorId);
    if (!sector) continue;
    const [rollups, definitions] = await Promise.all([
      getTargetRollups(sector.id),
      findSectorDefinitions(sector.id),
    ]);
    if (!rollups.success) continue;
    const view = rollups.data.find((entry) => entry.target.id === target.id);
    if (!view) continue;
    const unitByDefinition = new Map(definitions.map((definition) => [definition.id, definition.unit]));
    resolved.push({ id: screen.id, kind: "target_board", dwellSeconds: screen.dwellSeconds, ...boardLiteFrom(view, unitByDefinition) });
  }

  const data: TvBoardView = { label: board.label, screens: resolved };
  return { success: true, data };
}
