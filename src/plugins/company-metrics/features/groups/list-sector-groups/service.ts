import { findSectorGroups } from "./store";
import type { ListSectorGroupsResult } from "./types";

export async function listSectorGroups(filter: { sectorId?: string; sectorIds?: string[] }): Promise<ListSectorGroupsResult> {
  return { success: true, data: await findSectorGroups(filter) };
}
