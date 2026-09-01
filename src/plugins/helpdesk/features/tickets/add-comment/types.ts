import type { OperationResult } from "@/shared/types";
import type { TicketEventRecord, TicketEventVisibility } from "../../../contracts/types";

export type AddCommentCommand = {
  ticketId: string;
  body: string;
  visibility: TicketEventVisibility;
  authorUserId: string;
  // true quando o autor é a equipe (helpdesk.work/manage) — só a equipe grava nota `internal`.
  isTeamMember: boolean;
};

export type AddCommentInput = { ticketId: string; body: string; visibility?: TicketEventVisibility };

export type AddCommentResult = OperationResult<{ event: TicketEventRecord; statusChangedTo: string | null }>;
