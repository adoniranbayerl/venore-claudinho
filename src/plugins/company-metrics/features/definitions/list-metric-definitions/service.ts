import { findMetricDefinitions } from "./store";
import type { ListMetricDefinitionsResult } from "./types";

export async function listMetricDefinitions(filter: {
  sectorId?: string;
  sectorIds?: string[];
  includeArchived?: boolean;
}): Promise<ListMetricDefinitionsResult> {
  return {
    success: true,
    data: await findMetricDefinitions({
      sectorId: filter.sectorId,
      sectorIds: filter.sectorIds,
      includeArchived: filter.includeArchived ?? false,
    }),
  };
}
