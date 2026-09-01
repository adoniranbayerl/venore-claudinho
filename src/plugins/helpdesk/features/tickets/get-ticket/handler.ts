import { getCurrentUser } from "@/contexts/auth";
import { resolveTicketViewActor } from "../../../shared/scoped-authorization";
import { assembleTicketDetail } from "./service";
import { findTicketById, findTicketByQueueKeyAndSeq } from "./store";
import type { GetTicketQuery, GetTicketResult } from "./types";

const NOT_FOUND = { code: "helpdesk.get-ticket.not_found", message: "Chamado não encontrado." } as const;

// Ver um chamado: (a) o solicitante vê o PRÓPRIO chamado sem permission (self-service, timeline só
// com eventos `public`); (b) a equipe/liderança vê via resolveTicketViewActor (helpdesk.manage/
// read → qualquer fila; helpdesk.work → filas em que é membro), com as notas `internal`.
export async function getTicketHandler(query: GetTicketQuery): Promise<GetTicketResult> {
  const ticket =
    "ticketId" in query
      ? await findTicketById(query.ticketId)
      : await findTicketByQueueKeyAndSeq(query.queueKey, query.seq);

  if (!ticket) {
    return { success: false, error: NOT_FOUND };
  }

  const currentUser = await getCurrentUser();
  const actorId = currentUser.success ? currentUser.data?.id ?? null : null;

  if (actorId && ticket.requesterUserId === actorId) {
    return assembleTicketDetail(ticket, false);
  }

  const view = await resolveTicketViewActor(ticket.id);
  if (!view.authorized) {
    return { success: false, error: view.error };
  }

  return assembleTicketDetail(ticket, view.canSeeInternal);
}
