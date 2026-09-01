import type { OperationResult } from "@/shared/types";
import type { TicketRecord, TicketStatus } from "../../../contracts/types";

export type ChangeStatusCommand = {
  ticketId: string;
  to: TicketStatus;
  note?: string | null;
  actorId: string;
};

export type ChangeStatusInput = { ticketId: string; to: TicketStatus; note?: string | null };

export type ChangeStatusResult = OperationResult<TicketRecord>;
