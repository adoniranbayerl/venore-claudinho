import { findSectorMembers } from "./store";
import type { ListSectorMembersResult } from "./types";

export async function listSectorMembers(sectorId: string): Promise<ListSectorMembersResult> {
  return { success: true, data: await findSectorMembers(sectorId) };
}
