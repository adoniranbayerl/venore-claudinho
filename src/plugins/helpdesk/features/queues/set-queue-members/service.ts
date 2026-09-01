import { beginOperation, endOperation } from "@/observability";
import { QUEUE_MEMBER_ROLES } from "../../../contracts/types";
import { findManagerUserIds, findQueueById, replaceQueueMembers } from "./store";
import type { SetQueueMembersCommand, SetQueueMembersResult } from "./types";

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((value) => setB.has(value));
}

export async function setQueueMembers(command: SetQueueMembersCommand): Promise<SetQueueMembersResult> {
  const queue = await findQueueById(command.queueId);
  if (!queue) {
    return { success: false, error: { code: "helpdesk.set-queue-members.not_found", message: "Fila não encontrada." } };
  }

  const seen = new Set<string>();
  for (const member of command.members) {
    if (!member.userId || member.userId.trim().length === 0) {
      return { success: false, error: { code: "helpdesk.set-queue-members.invalid_user", message: "Membro sem usuário informado." } };
    }
    if (seen.has(member.userId)) {
      return { success: false, error: { code: "helpdesk.set-queue-members.duplicate_user", message: "O mesmo usuário aparece mais de uma vez." } };
    }
    seen.add(member.userId);
    if (!QUEUE_MEMBER_ROLES.includes(member.role)) {
      return { success: false, error: { code: "helpdesk.set-queue-members.invalid_role", message: "Papel de membro inválido." } };
    }
  }

  // "Manager" de fila (sem helpdesk.manage) não pode mexer no conjunto de "manager" da fila —
  // nem promover, nem rebaixar, nem remover. Só a permission ampla faz isso.
  if (!command.canManageManagers) {
    const currentManagers = await findManagerUserIds(command.queueId);
    const nextManagers = command.members.filter((member) => member.role === "manager").map((member) => member.userId);
    if (!sameSet(currentManagers, nextManagers)) {
      return {
        success: false,
        error: {
          code: "helpdesk.set-queue-members.manager_change_forbidden",
          message: "Só um administrador de Chamados pode alterar os gestores da fila.",
        },
      };
    }
  }

  const handle = beginOperation({
    useCase: "helpdesk.set-queue-members",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  await replaceQueueMembers(command.queueId, command.members);

  endOperation(handle, { success: true });
  return { success: true, data: { queueId: command.queueId, members: command.members } };
}
