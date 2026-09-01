import { getCurrentUser } from "@/contexts/auth";
import { listMyTickets } from "./service";
import type { ListMyTicketsResult } from "./types";

export async function listMyTicketsHandler(): Promise<ListMyTicketsResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "helpdesk.list-my-tickets.unauthenticated", message: "É necessário estar autenticado para ver seus chamados." },
    };
  }

  return listMyTickets(currentUser.data.id);
}
