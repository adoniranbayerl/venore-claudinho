import { authorizeActor } from "@/contexts/rbac";
import { listEntriesForAdmin } from "./service";
import type { ListEntriesForAdminQuery, ListEntriesForAdminResult } from "./types";

// Leitura administrativa: diferente de list-entries (público, só published), esta lista entries
// de qualquer status e por isso exige cms.entries.manage (docs/venore-docks.md — CMS).
export async function listEntriesForAdminHandler(
  query: ListEntriesForAdminQuery = {},
): Promise<ListEntriesForAdminResult> {
  const authz = await authorizeActor("cms.entries.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listEntriesForAdmin(query);
}
