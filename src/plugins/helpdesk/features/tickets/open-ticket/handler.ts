import { getCurrentUser } from "@/contexts/auth";
import { openTicket } from "./service";
import { validateOpenTicketInput } from "./validation";
import type { OpenTicketInput, OpenTicketResult } from "./types";

// Abrir um chamado é self-service — não exige permission, só sessão (§3.1, mesmo padrão de
// contexts/auth updateOwnAvatar/setOwnPassword). O portal `/chamados` já exige estar logado.
export async function openTicketHandler(input: OpenTicketInput): Promise<OpenTicketResult> {
  const validationError = validateOpenTicketInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "helpdesk.open-ticket.unauthenticated", message: "É necessário estar autenticado para abrir um chamado." },
    };
  }

  return openTicket({ ...input, requesterUserId: currentUser.data.id });
}
