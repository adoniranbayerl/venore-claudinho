import type { OperationResult } from "@/shared/types";
import type { QueueMemberRole } from "../../../contracts/types";

export type QueueMemberAssignment = { userId: string; role: QueueMemberRole };

export type SetQueueMembersCommand = {
  queueId: string;
  members: QueueMemberAssignment[];
  // true só quando o ator tem helpdesk.manage — só ele adiciona/remove/altera linhas com role
  // "manager". Um "manager" de fila (sem a permission ampla) mexe só em "agent".
  canManageManagers: boolean;
  actorId: string;
};

export type SetQueueMembersInput = { queueId: string; members: QueueMemberAssignment[] };
export type SetQueueMembersResult = OperationResult<{ queueId: string; members: QueueMemberAssignment[] }>;
