import { authorizeActor } from "@/contexts/rbac";
import { publishEntry } from "./service";
import type { PublishEntryInput, PublishEntryResult } from "./types";

export async function publishEntryHandler(input: PublishEntryInput): Promise<PublishEntryResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_id", message: "id não pode ser vazio." } };
  }

  // Fase 4/P3: publicar exige a permission estreita (cms.entries.publish) ou a ampla
  // (cms.entries.manage, que já cobria isso antes — quem já tem continua podendo).
  const authz = await authorizeActor(["cms.entries.publish", "cms.entries.manage"]);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return publishEntry({ ...input, actorId: authz.actorId });
}
