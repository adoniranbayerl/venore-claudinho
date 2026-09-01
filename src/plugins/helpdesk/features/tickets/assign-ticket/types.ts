import type { OperationResult } from "@/shared/types";
import type { TicketRecord } from "../../../contracts/types";

export type AssignTicketCommand = {
  ticketId: string;
  // null = desatribuir.
  assigneeUserId: string | null;
  actorId: string;
};

export type AssignTicketInput = { ticketId: string; assigneeUserId: string | null };

export type AssignTicketResult = OperationResult<TicketRecord>;
