import { describe, expect, it } from "vitest";
import { seedQueue, seedQueueMembers, seedUser } from "@/test-support/integration/helpdesk-seed";
import { openTicket } from "./open-ticket/service";
import { assignTicket } from "./assign-ticket/service";
import { changeStatus } from "./change-status/service";
import { rateTicket } from "./rate-ticket/service";
import { reopenTicket } from "./reopen-ticket/service";
import { findTicketById } from "./get-ticket/store";
import { getQueueReport } from "../reporting/get-queue-report/service";
import { listNotificationsForUser } from "../../shared/notification-store";

// Fase 7 (docs/chamados-plugin.md §7, §10.2 — "resolver→avaliar→reabrir"), cruzando tickets +
// ticket_events + helpdesk_notifications + a agregação do relatório. Teste de integração.
describe("helpdesk — avaliação + reabertura + relatório (integração)", () => {
  it("resolve → avaliar (denormaliza + notifica) → reabrir (reopened_count++) → o relatório reflete", async () => {
    const boss = await seedUser({ name: "Gestor" });
    const agent = await seedUser({ name: "Técnico" });
    const requester = await seedUser({ name: "Solicitante" });

    const queue = await seedQueue(boss.id, { name: "Manutenção" });
    await seedQueueMembers(queue.id, [{ userId: agent.id, role: "agent" }], boss.id);

    const opened = await openTicket({
      queueId: queue.id,
      title: "Ar-condicionado pingando",
      description: "Sala 12.",
      requesterUserId: requester.id,
    });
    expect(opened.success).toBe(true);
    if (!opened.success) return;
    const ticketId = opened.data.ticket.id;

    await assignTicket(
      { ticketId, assigneeUserId: agent.id, actorId: boss.id },
      { queueId: queue.id, currentAssigneeUserId: null },
    );

    // resolver (o responsável)
    const resolved = await changeStatus(
      { ticketId, to: "resolved", note: "Regulado o dreno.", actorId: agent.id },
      {
        currentStatus: "open",
        capabilities: { hasManagePermission: false, isQueueManager: false, isAssignee: true, isQueueMember: true },
      },
    );
    expect(resolved.success).toBe(true);
    const afterResolve = await findTicketById(ticketId);
    expect(afterResolve?.resolvedAt).not.toBeNull();

    // avaliar pelo portal (o próprio solicitante) — denormaliza tickets.rating_score
    const rated = await rateTicket({
      ticketId,
      queueId: queue.id,
      status: "resolved",
      score: 4,
      comment: "Resolveu, mas demorou.",
      authorUserId: requester.id,
      authorLabel: null,
    });
    expect(rated.success).toBe(true);

    const afterRating = await findTicketById(ticketId);
    expect(afterRating?.ratingScore).toBe(4);
    // o técnico atribuído recebeu `rating_received`
    expect((await listNotificationsForUser(agent.id)).map((n) => n.kind)).toContain("rating_received");

    // reabrir dentro da janela — reopened_count++ e volta para in_progress
    const reopened = await reopenTicket({
      ticketId,
      queueId: queue.id,
      status: "resolved",
      resolvedAt: afterRating!.resolvedAt,
      note: "Voltou a pingar hoje.",
      actorUserId: requester.id,
      authorLabel: null,
    });
    expect(reopened.success).toBe(true);

    const afterReopen = await findTicketById(ticketId);
    expect(afterReopen?.status).toBe("in_progress");
    expect(afterReopen?.reopenedCount).toBe(1);
    expect(afterReopen?.resolvedAt).toBeNull();
    expect(afterReopen?.closedAt).toBeNull();
    // a nota sobrevive à reabertura (não é zerada)
    expect(afterReopen?.ratingScore).toBe(4);
    // técnico + fila receberam `reopened`
    expect((await listNotificationsForUser(agent.id)).map((n) => n.kind)).toContain("reopened");

    // o relatório da fila: 1 chamado aberto agora, nota média 4 sobre 1 avaliação, sem resolvidos
    // em aberto no momento (foi reaberto)
    const report = await getQueueReport({ allowedQueueIds: [queue.id] });
    expect(report.success).toBe(true);
    if (!report.success) return;
    const row = report.data.rows.find((r) => r.queueId === queue.id);
    expect(row).toBeDefined();
    expect(row!.openCount).toBe(1);
    expect(row!.avgRating).toBe(4);
    expect(row!.ratedCount).toBe(1);
    expect(row!.resolvedCount).toBe(0);
  });
});
