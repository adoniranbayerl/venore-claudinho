import { beginOperation, endOperation } from "@/observability";
import { MAX_TICKET_ATTACHMENTS_PER_SCOPE } from "../../../contracts/types";
import { formatTicketReference } from "../../../shared/ticket-reference";
import { notificationSummary, notify } from "../../../shared/notify";
import { slaDueAt as computeSlaDueAt } from "../../../shared/sla";
import { resolveResolutionMinutes } from "../../../shared/sla-policy-store";
import { createTicketWithSequence, findCategoryForOpen, findQueueForOpen } from "./store";
import type { OpenTicketCommand, OpenTicketResult } from "./types";
import type { TicketPriority } from "../../../contracts/types";

export async function openTicket(command: OpenTicketCommand): Promise<OpenTicketResult> {
  const queue = await findQueueForOpen(command.queueId);
  if (!queue) {
    return { success: false, error: { code: "helpdesk.open-ticket.queue_not_found", message: "Fila não encontrada." } };
  }
  if (queue.archivedAt !== null) {
    return { success: false, error: { code: "helpdesk.open-ticket.queue_archived", message: "Essa fila está arquivada e não recebe novos chamados." } };
  }

  let categoryId: string | null = null;
  let categoryDefaultPriority: TicketPriority | null = null;
  if (command.categoryId) {
    const category = await findCategoryForOpen(command.categoryId);
    if (!category || category.queueId !== queue.id) {
      return { success: false, error: { code: "helpdesk.open-ticket.category_not_found", message: "Categoria não encontrada nessa fila." } };
    }
    if (category.archivedAt !== null) {
      return { success: false, error: { code: "helpdesk.open-ticket.category_archived", message: "Essa categoria está arquivada." } };
    }
    categoryId = category.id;
    categoryDefaultPriority = category.defaultPriority;
  }

  // §2.4 — a prioridade da categoria vence a da fila; sem nenhuma, `normal`. `sla_due_at` = now +
  // resolution_minutes da política vigente da fila para essa prioridade (padrão corrido quando a
  // fila não configurou).
  const priority: TicketPriority = categoryDefaultPriority ?? queue.defaultPriority ?? "normal";
  const resolutionMinutes = await resolveResolutionMinutes(queue.id, priority);
  const slaDueAt = computeSlaDueAt(new Date(), resolutionMinutes);

  const attachmentMediaIds = (command.attachmentMediaIds ?? []).filter((id) => id.trim().length > 0);
  if (attachmentMediaIds.length > MAX_TICKET_ATTACHMENTS_PER_SCOPE) {
    return {
      success: false,
      error: {
        code: "helpdesk.open-ticket.too_many_attachments",
        message: `Anexe no máximo ${MAX_TICKET_ATTACHMENTS_PER_SCOPE} fotos ao abrir o chamado.`,
      },
    };
  }

  const handle = beginOperation({
    useCase: "helpdesk.open-ticket",
    actor: { id: command.requesterUserId, type: "user" },
    kind: "write",
  });

  const ticket = await createTicketWithSequence({
    queueId: queue.id,
    categoryId,
    title: command.title.trim(),
    description: command.description.trim(),
    location: command.location?.trim() || null,
    requesterUserId: command.requesterUserId,
    attachmentMediaIds,
    priority,
    slaDueAt,
  });

  const reference = formatTicketReference({ queueKey: queue.key, seq: ticket.seq });

  // §2.3 — todo manager/agent da fila recebe `new_ticket`. O solicitante (autor) nunca se
  // autonotifica; `resolveNotificationRecipients` já exclui.
  await notify({
    ticketId: ticket.id,
    queueId: queue.id,
    kind: "new_ticket",
    summary: notificationSummary({ queueName: queue.name, reference, text: "novo chamado" }),
    actorUserId: command.requesterUserId,
    audiences: ["queue"],
  });

  endOperation(handle, { success: true });
  return { success: true, data: { ticket, reference } };
}
