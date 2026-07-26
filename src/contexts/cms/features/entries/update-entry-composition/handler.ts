import { authorizeActor } from "@/contexts/rbac";
import { updateEntryComposition } from "./service";
import type { UpdateEntryCompositionInput, UpdateEntryCompositionResult } from "./types";

export async function updateEntryCompositionHandler(
  input: UpdateEntryCompositionInput,
): Promise<UpdateEntryCompositionResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("cms.entries.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateEntryComposition({ ...input, actorId: authz.actorId });
}
