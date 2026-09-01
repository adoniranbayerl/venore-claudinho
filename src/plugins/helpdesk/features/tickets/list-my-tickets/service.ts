import { findTicketListItems } from "../../../shared/ticket-list-store";
import type { ListMyTicketsResult } from "./types";

// Chamados abertos pelo próprio solicitante (requesterUserId = ator da sessão) — self-service,
// sem permission. Vê qualquer fila, mas só os próprios chamados.
export async function listMyTickets(requesterUserId: string): Promise<ListMyTicketsResult> {
  return { success: true, data: await findTicketListItems({ requesterUserId }) };
}
