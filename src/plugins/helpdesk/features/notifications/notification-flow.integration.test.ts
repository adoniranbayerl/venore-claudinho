import { describe, expect, it } from "vitest";
import { seedQueue, seedQueueMembers, seedUser } from "@/test-support/integration/helpdesk-seed";
import { openTicket } from "../tickets/open-ticket/service";
import { assignTicket } from "../tickets/assign-ticket/service";
import { addComment } from "../tickets/add-comment/service";
import { changeStatus } from "../tickets/change-status/service";
import {
  countUnreadForUser,
  listNotificationsForUser,
  markNotificationsReadForUser,
} from "../../shared/notification-store";

// Fluxo de notificação (§2.3), cruzando tickets + ticket_events + queue_members +
// helpdesk_notifications — por isso é teste de integração (docs/chamados-plugin.md §7). Confere que
// cada ação grava a linha certa, para o destinatário certo, nunca para o autor.
describe("helpdesk — fluxo de notificação (integração)", () => {
  it("open → assign → comment → resolve geram notificações para os destinatários certos", async () => {
    const boss = await seedUser({ name: "Gestor" });
    const agentA = await seedUser({ name: "Técnico A" });
    const agentB = await seedUser({ name: "Técnico B" });
    const requester = await seedUser({ name: "Solicitante" });

    const queue = await seedQueue(boss.id, { name: "Manutenção" });
    await seedQueueMembers(
      queue.id,
      [
        { userId: boss.id, role: "manager" },
        { userId: agentA.id, role: "agent" },
        { userId: agentB.id, role: "agent" },
      ],
      boss.id,
    );

    // 1 — abrir: manager + agents da fila recebem `new_ticket`; o solicitante (autor) não.
    const opened = await openTicket({
      queueId: queue.id,
      title: "Ar-condicionado pingando",
      description: "Sala 12.",
      requesterUserId: requester.id,
    });
    expect(opened.success).toBe(true);
    if (!opened.success) return;
    const ticketId = opened.data.ticket.id;

    expect((await listNotificationsForUser(agentA.id)).map((n) => n.kind)).toEqual(["new_ticket"]);
    expect((await listNotificationsForUser(agentB.id)).map((n) => n.kind)).toEqual(["new_ticket"]);
    expect((await listNotificationsForUser(boss.id)).map((n) => n.kind)).toEqual(["new_ticket"]);
    expect(await listNotificationsForUser(requester.id)).toHaveLength(0);

    const firstForAgentA = (await listNotificationsForUser(agentA.id))[0];
    expect(firstForAgentA.summary).toContain(opened.data.reference);
    expect(firstForAgentA.reference).toBe(opened.data.reference);

    // 2 — atribuir a A (ação do gestor): só A recebe `assigned_to_you`.
    const assigned = await assignTicket(
      { ticketId, assigneeUserId: agentA.id, actorId: boss.id },
      { queueId: queue.id, currentAssigneeUserId: null },
    );
    expect(assigned.success).toBe(true);
    expect((await listNotificationsForUser(agentA.id)).map((n) => n.kind)).toEqual(["assigned_to_you", "new_ticket"]);
    expect((await listNotificationsForUser(agentB.id)).map((n) => n.kind)).toEqual(["new_ticket"]);

    // 3 — comentário público do técnico A: solicitante + fila (menos A, o autor) recebem
    // `comment_added`.
    const commented = await addComment({
      ticketId,
      body: "Fui até a sala, troquei o filtro.",
      visibility: "public",
      authorUserId: agentA.id,
      isTeamMember: true,
    });
    expect(commented.success).toBe(true);
    expect((await listNotificationsForUser(requester.id)).map((n) => n.kind)).toEqual(["comment_added"]);
    expect((await listNotificationsForUser(agentB.id)).map((n) => n.kind)).toEqual(["comment_added", "new_ticket"]);
    // A é o autor — não ganhou linha nova.
    expect((await listNotificationsForUser(agentA.id)).map((n) => n.kind)).toEqual(["assigned_to_you", "new_ticket"]);

    // 4 — resolver (o responsável A): o solicitante recebe `resolved`.
    const resolved = await changeStatus(
      { ticketId, to: "resolved", note: "Resolvido.", actorId: agentA.id },
      {
        currentStatus: "open",
        capabilities: { hasManagePermission: false, isQueueManager: false, isAssignee: true, isQueueMember: true },
      },
    );
    expect(resolved.success).toBe(true);
    expect((await listNotificationsForUser(requester.id)).map((n) => n.kind)).toEqual(["resolved", "comment_added"]);

    // 5 — marcar lidas: o contador do solicitante zera.
    expect(await countUnreadForUser(requester.id)).toBe(2);
    const marked = await markNotificationsReadForUser(requester.id, []);
    expect(marked).toBe(2);
    expect(await countUnreadForUser(requester.id)).toBe(0);
    // não mexeu nas de outra pessoa
    expect(await countUnreadForUser(agentB.id)).toBe(2);
  });
});
