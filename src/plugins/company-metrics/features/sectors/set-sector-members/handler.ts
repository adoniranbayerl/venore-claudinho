import { authorizeActor } from "@/contexts/rbac";
import { authorizeSectorConfigActor } from "../../../shared/scoped-authorization";
import { setSectorMembers } from "./service";
import type { SetSectorMembersInput, SetSectorMembersResult } from "./types";

// company-metrics.manage delega qualquer papel (inclusive admin). Um admin de setor delega só
// editor/viewer — a checagem fina fica no service (canManageAdmins).
export async function setSectorMembersHandler(input: SetSectorMembersInput): Promise<SetSectorMembersResult> {
  if (!input.sectorId || input.sectorId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.set-sector-members.missing_sector", message: "Setor não informado." } };
  }

  const full = await authorizeActor("company-metrics.manage");
  if (full.authorized) {
    return setSectorMembers({ ...input, canManageAdmins: true, actorId: full.actorId });
  }

  const scoped = await authorizeSectorConfigActor(input.sectorId);
  if (!scoped.authorized) {
    return { success: false, error: scoped.error };
  }

  return setSectorMembers({ ...input, canManageAdmins: false, actorId: scoped.actorId });
}
