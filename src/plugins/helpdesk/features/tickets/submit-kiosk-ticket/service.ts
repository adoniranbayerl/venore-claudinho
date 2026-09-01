import { beginOperation, endOperation } from "@/observability";
import { generateTrackingToken } from "../../../shared/kiosk-token";
import { notificationSummary, notify } from "../../../shared/notify";
import { slaDueAt as computeSlaDueAt } from "../../../shared/sla";
import { resolveResolutionMinutes } from "../../../shared/sla-policy-store";
import { formatTicketReference } from "../../../shared/ticket-reference";
import { createKioskTicketWithSequence, findActiveQueueForKioskSubmit } from "./store";
import type { SubmitKioskTicketCommand, SubmitKioskTicketResult } from "./types";

// Título curto derivado da 1ª linha da descrição — o formulário do quiosque não pede título
// (§2.5). Mantém a lista/admin legíveis sem obrigar a pessoa a resumir o problema.
function deriveTitle(description: string): string {
  const firstLine = description.trim().split(/\r?\n/, 1)[0]?.trim() ?? "";
  const clipped = firstLine.length > 80 ? `${firstLine.slice(0, 79).trimEnd()}…` : firstLine;
  return clipped || "Chamado do quiosque";
}

// Sem authorizeActor (§2.5) — o handler já validou o token do quiosque e aplicou o throttle. Aqui
// é só a regra de negócio: resolver a fila (ativa), abrir o chamado anônimo com `tracking_token`
// novo e avisar a fila (`new_ticket`).
export async function submitKioskTicket(command: SubmitKioskTicketCommand): Promise<SubmitKioskTicketResult> {
  const queue = await findActiveQueueForKioskSubmit(command.queueId);
  if (!queue) {
    return {
      success: false,
      error: { code: "helpdesk.submit-kiosk-ticket.queue_unavailable", message: "Fila de atendimento indisponível." },
    };
  }

  const priority = queue.defaultPriority ?? "normal";
  const resolutionMinutes = await resolveResolutionMinutes(queue.id, priority);
  const slaDueAt = computeSlaDueAt(new Date(), resolutionMinutes);
  const trackingToken = generateTrackingToken();

  const handle = beginOperation({
    useCase: "helpdesk.submit-kiosk-ticket",
    // Sem ator humano — a linha de auditoria fica presa ao quiosque de origem.
    actor: { id: command.kioskId, type: "kiosk" },
    kind: "write",
  });

  const ticket = await createKioskTicketWithSequence({
    queueId: queue.id,
    title: deriveTitle(command.description),
    description: command.description.trim(),
    location: command.location?.trim() || null,
    requesterName: command.requesterName?.trim() || null,
    requesterContact: command.requesterContact?.trim() || null,
    originKioskId: command.kioskId,
    trackingToken,
    priority,
    slaDueAt,
  });

  const reference = formatTicketReference({ queueKey: queue.key, seq: ticket.seq });

  // §2.3 — todo manager/agent da fila recebe `new_ticket`. Solicitante anônimo não recebe push
  // (acompanha pelo link); actorUserId null → ninguém é excluído por "ser o autor".
  await notify({
    ticketId: ticket.id,
    queueId: queue.id,
    kind: "new_ticket",
    summary: notificationSummary({ queueName: queue.name, reference, text: "novo chamado (quiosque)" }),
    actorUserId: null,
    audiences: ["queue"],
  });

  endOperation(handle, { success: true });
  return {
    success: true,
    data: { reference, trackingToken, trackingPath: `/chamados/acompanhar/${trackingToken}` },
  };
}
