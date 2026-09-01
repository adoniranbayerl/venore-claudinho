import type { OperationResult } from "@/shared/types";
import type { TicketListItem, TicketStatus } from "../../../contracts/types";

export type ListTicketsQuery = {
  queueId?: string;
  status?: TicketStatus;
  // "open" (padrão da aba Fila): tudo que não está closed/cancelled.
  onlyActive?: boolean;
  assignedToMe?: boolean;
};

export type ListTicketsResult = OperationResult<TicketListItem[]>;
