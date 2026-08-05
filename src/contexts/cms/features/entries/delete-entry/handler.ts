import { authorizeActor } from "@/contexts/rbac";
import { deleteEntry } from "./service";
import type { DeleteEntryInput, DeleteEntryResult } from "./types";

export async function deleteEntryHandler(input: DeleteEntryInput): Promise<DeleteEntryResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("cms.entries.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteEntry({ ...input, actorId: authz.actorId });
}
