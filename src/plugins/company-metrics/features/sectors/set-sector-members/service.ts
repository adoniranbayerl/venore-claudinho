import { beginOperation, endOperation } from "@/observability";
import { SECTOR_MEMBER_ROLES } from "../../../contracts/types";
import { findAdminUserIds, findSectorById, replaceSectorMembers } from "./store";
import type { SetSectorMembersCommand, SetSectorMembersResult } from "./types";

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((value) => setB.has(value));
}

export async function setSectorMembers(command: SetSectorMembersCommand): Promise<SetSectorMembersResult> {
  const sector = await findSectorById(command.sectorId);
  if (!sector) {
    return { success: false, error: { code: "company-metrics.set-sector-members.not_found", message: "Setor não encontrado." } };
  }

  const seen = new Set<string>();
  for (const member of command.members) {
    if (!member.userId || member.userId.trim().length === 0) {
      return { success: false, error: { code: "company-metrics.set-sector-members.invalid_user", message: "Membro sem usuário informado." } };
    }
    if (seen.has(member.userId)) {
      return { success: false, error: { code: "company-metrics.set-sector-members.duplicate_user", message: "O mesmo usuário aparece mais de uma vez." } };
    }
    seen.add(member.userId);
    if (!SECTOR_MEMBER_ROLES.includes(member.role)) {
      return { success: false, error: { code: "company-metrics.set-sector-members.invalid_role", message: "Papel de membro inválido." } };
    }
  }

  // Admin de setor (sem company-metrics.manage) não pode mexer no conjunto de "admin" do setor —
  // nem promover, nem rebaixar, nem remover. Só a permission ampla faz isso.
  if (!command.canManageAdmins) {
    const currentAdmins = await findAdminUserIds(command.sectorId);
    const nextAdmins = command.members.filter((member) => member.role === "admin").map((member) => member.userId);
    if (!sameSet(currentAdmins, nextAdmins)) {
      return {
        success: false,
        error: {
          code: "company-metrics.set-sector-members.admin_change_forbidden",
          message: "Só um administrador de Métricas Internas pode alterar os administradores do setor.",
        },
      };
    }
  }

  const handle = beginOperation({
    useCase: "company-metrics.set-sector-members",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  await replaceSectorMembers(command.sectorId, command.members);

  endOperation(handle, { success: true });
  return { success: true, data: { sectorId: command.sectorId, members: command.members } };
}
