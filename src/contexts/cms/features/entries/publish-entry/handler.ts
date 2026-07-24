import { authorizeActor } from "@/contexts/rbac";
import { publishEntry } from "./service";
import type { PublishEntryInput, PublishEntryResult } from "./types";

export async function publishEntryHandler(input: PublishEntryInput): Promise<PublishEntryResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("cms.entries.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return publishEntry({ ...input, actorId: authz.actorId });
}
