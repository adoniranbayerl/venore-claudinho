import type { OperationResult } from "@/shared/types";
import type { TicketPriority, TicketRecord } from "../../../contracts/types";

export type ChangePriorityCommand = {
  ticketId: string;
  to: TicketPriority;
  actorId: string;
};

export type ChangePriorityInput = { ticketId: string; priority: TicketPriority };

export type ChangePriorityResult = OperationResult<TicketRecord>;
