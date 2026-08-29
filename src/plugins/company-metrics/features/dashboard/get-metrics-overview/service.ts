import type { TargetRollupStatus } from "../../../contracts/types";
import { getTargetRollups } from "../../targets/get-target-rollups/service";
import { findActiveSectors, findLastUpdateBySector } from "./store";
import type { GetMetricsOverviewResult, SectorOverview } from "./types";

function emptyCounts(): Record<TargetRollupStatus, number> {
  return { met: 0, on_track: 0, below: 0 };
}

export async function getMetricsOverview(options: { sectorIds?: string[] }): Promise<GetMetricsOverviewResult> {
  const sectors = await findActiveSectors(options.sectorIds);
  const lastUpdateBySector = await findLastUpdateBySector(sectors.map((sector) => sector.id));

  const overviews: SectorOverview[] = await Promise.all(
    sectors.map(async (sector) => {
      const rollupsResult = await getTargetRollups(sector.id);
      const rollups = rollupsResult.success ? rollupsResult.data : [];

      const statusCounts = emptyCounts();
      let completionSum = 0;
      for (const view of rollups) {
        statusCounts[view.rollup.status] += 1;
        completionSum += view.rollup.completion;
      }

      return {
        sector,
        targetCount: rollups.length,
        statusCounts,
        averageCompletion: rollups.length > 0 ? completionSum / rollups.length : null,
        lastUpdatedAt: lastUpdateBySector.get(sector.id) ?? null,
      };
    }),
  );

  return { success: true, data: { sectors: overviews } };
}
