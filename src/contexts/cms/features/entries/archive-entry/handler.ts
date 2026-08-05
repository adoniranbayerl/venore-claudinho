import { authorizeActor } from "@/contexts/rbac";
import { archiveEntry } from "./service";
import type { ArchiveEntryInput, ArchiveEntryResult } from "./types";

export async function archiveEntryHandler(input: ArchiveEntryInput): Promise<ArchiveEntryResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("cms.entries.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return archiveEntry({ ...input, actorId: authz.actorId });
}
