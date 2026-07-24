import { findAllEntries } from "./store";
import type { ListEntriesForAdminQuery, ListEntriesForAdminResult } from "./types";

export async function listEntriesForAdmin(query: ListEntriesForAdminQuery): Promise<ListEntriesForAdminResult> {
  const entries = await findAllEntries(query);
  return { success: true, data: entries };
}
