import { getSetting } from "@/contexts/settings";
import type { ResolvedTvScreen, TvBoardView } from "../../../contracts/types";
import { normalizeTimeZone } from "../../../shared/settings";
import { getMetricsOverview } from "../../dashboard/get-metrics-overview/service";
import { getSectorDashboard } from "../../dashboard/get-sector-dashboard/service";
import { getTargetRollups } from "../../targets/get-target-rollups/service";
import { findBoardByToken, findScreensForBoards } from "../shared/store";
import { findDefinitionUnit, findSectorById, findTargetById } from "./store";
import type { GetTvBoardResult } from "./types";

// SEM authorizeActor — acesso por token na URL (mesma regra de broadcast/enrollment). Resolve
// cada tela do board no view model pronto para o telão. Telas cujo setor/meta foi apagado são
// puladas (referência null).
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

    // target_board
    if (!screen.targetId) continue;
    const target = await findTargetById(screen.targetId);
    if (!target) continue;
    const sector = await findSectorById(target.sectorId);
    if (!sector) continue;
    const rollups = await getTargetRollups(sector.id);
    if (!rollups.success) continue;
    const view = rollups.data.find((entry) => entry.target.id === target.id);
    if (!view) continue;
    const realizedLine = view.lines.find((line) => line.classification === "realized");
    const unit = (realizedLine ? await findDefinitionUnit(realizedLine.definitionId) : null) ?? "count";
    resolved.push({
      id: screen.id,
      kind: "target_board",
      dwellSeconds: screen.dwellSeconds,
      label: target.label,
      unit,
      periodStart: target.periodStart,
      periodEnd: target.periodEnd,
      rollup: view.rollup,
    });
  }

  const data: TvBoardView = { label: board.label, screens: resolved };
  return { success: true, data };
}
