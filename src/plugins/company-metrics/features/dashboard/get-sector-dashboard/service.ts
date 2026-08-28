import { getTargetRollups } from "../../targets/get-target-rollups/service";
import { subtractMonths, zonedCivilDate } from "../../../shared/period";
import { DEFAULT_COMPANY_METRICS_TIMEZONE } from "../../../shared/settings";
import type { MetricSeries } from "./types";
import { findActiveDefinitions, findSectorById, findValuesSince } from "./store";
import type { GetSectorDashboardResult } from "./types";

const ALLOWED_WINDOWS = [3, 6, 12];

export async function getSectorDashboard(options: {
  sectorId: string;
  windowMonths?: number;
  timeZone?: string;
  now?: Date;
}): Promise<GetSectorDashboardResult> {
  const sector = await findSectorById(options.sectorId);
  if (!sector) {
    return { success: false, error: { code: "company-metrics.get-sector-dashboard.not_found", message: "Setor não encontrado." } };
  }

  const windowMonths = ALLOWED_WINDOWS.includes(options.windowMonths ?? 0) ? (options.windowMonths as number) : 6;
  const timeZone = options.timeZone ?? DEFAULT_COMPANY_METRICS_TIMEZONE;
  const today = zonedCivilDate(options.now ?? new Date(), timeZone);
  const since = subtractMonths(today, windowMonths);

  const [rollups, definitions] = await Promise.all([
    getTargetRollups(options.sectorId),
    findActiveDefinitions(options.sectorId),
  ]);

  const values = await findValuesSince(definitions.map((definition) => definition.id), since);
  const pointsByDefinition = new Map<string, { periodStart: string; value: number }[]>();
  for (const value of values) {
    const list = pointsByDefinition.get(value.definitionId) ?? [];
    list.push({ periodStart: value.periodStart, value: value.value });
    pointsByDefinition.set(value.definitionId, list);
  }

  const metrics: MetricSeries[] = definitions.map((definition) => ({
    definition,
    points: pointsByDefinition.get(definition.id) ?? [],
  }));

  return {
    success: true,
    data: {
      sector,
      windowMonths,
      targets: rollups.success ? rollups.data : [],
      metrics,
    },
  };
}
