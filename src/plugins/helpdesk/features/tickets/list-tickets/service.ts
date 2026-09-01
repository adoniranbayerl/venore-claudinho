import { TICKET_STATUSES, type TicketStatus } from "../../../contracts/types";
import { findTicketListItems } from "../../../shared/ticket-list-store";
import type { ListTicketsResult } from "./types";

const ACTIVE_STATUSES = TICKET_STATUSES.filter((status) => status !== "closed" && status !== "cancelled");

// allowedQueueIds recorta pra só as filas em que o ator é membro (passado pelo handler quando ele
// só tem helpdesk.work). undefined = sem recorte (helpdesk.manage / helpdesk.read).
export async function listTickets(options: {
  allowedQueueIds?: string[];
  queueId?: string;
  status?: TicketStatus;
  onlyActive?: boolean;
  assigneeUserId?: string;
}): Promise<ListTicketsResult> {
  let queueIds = options.allowedQueueIds;
  if (options.queueId) {
    queueIds = queueIds ? queueIds.filter((id) => id === options.queueId) : [options.queueId];
  }

  const statuses = options.status
    ? [options.status]
    : options.onlyActive
      ? [...ACTIVE_STATUSES]
      : undefined;

  return {
    success: true,
    data: await findTicketListItems({
      queueIds,
      statuses,
      assigneeUserId: options.assigneeUserId,
    }),
  };
}
