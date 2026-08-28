import { authorizeActor } from "@/contexts/rbac";
import { publishEntry } from "./service";
import type { PublishEntryInput, PublishEntryResult } from "./types";

export async function publishEntryHandler(input: PublishEntryInput): Promise<PublishEntryResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_id", message: "id não pode ser vazio." } };
  }

  // Fase C / D6 (docs/rbac-scoped-roles.md): publicar exige `cms.entries.publish` — deixou de
  // aceitar `cms.entries.manage` como atalho. Author (só `manage`) não publica. `admin` tem
  // `cms.entries.publish` global; `superadmin` ignora. O recorte por categoria é no service.
  const authz = await authorizeActor("cms.entries.publish");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return publishEntry({ ...input, actorId: authz.actorId });
}
