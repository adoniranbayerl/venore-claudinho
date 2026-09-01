import { describe, expect, it } from "vitest";
import {
  seedCategory,
  seedMediaAsset,
  seedQueue,
  seedQueueMembers,
  seedUser,
} from "@/test-support/integration/helpdesk-seed";
import { openTicket } from "./open-ticket/service";
import { addComment } from "./add-comment/service";
import { assignTicket } from "./assign-ticket/service";
import { changeStatus } from "./change-status/service";
import { assembleTicketDetail } from "./get-ticket/service";
import { findTicketById } from "./get-ticket/store";
import { addTicketAttachment } from "../attachments/add-ticket-attachment/service";
import { listTicketAttachments } from "../attachments/list-ticket-attachments/service";
import type { TicketActorCapabilities } from "../../shared/ticket-state";

// Fluxo principal do plugin, cruzando domínios (tickets + ticket_events + ticket_counters +
// ticket_attachments + queue_members + contexts/media) — por isso é teste de integração
// (docs/chamados-plugin.md §7, AGENTS.md §6.6). Cobre abrir → anexar foto → comentar → atribuir →
// resolver → fechar.
describe("helpdesk — ciclo de vida do chamado (integração)", () => {
  it("abre, anexa foto, comenta, atribui, resolve e fecha; a timeline reflete cada passo", async () => {
    const boss = await seedUser({ name: "Gestor Chamados" });
    const agent = await seedUser({ name: "Técnico Manutenção" });
    const requester = await seedUser({ name: "Solicitante" });

    const queue = await seedQueue(boss.id, { name: "Manutenção" });
    await seedQueueMembers(queue.id, [{ userId: agent.id, role: "agent" }], boss.id);
    const category = await seedCategory(queue.id, boss.id, { label: "Elétrica" });
    const mediaId = await seedMediaAsset(requester.id);

    // 1 — abrir
    const opened = await openTicket({
      queueId: queue.id,
      categoryId: category.id,
      title: "Lâmpada queimada — sala do Marketing",
      description: "A luz do fundo não acende desde ontem.",
      location: "Bloco B, sala Marketing",
      requesterUserId: requester.id,
    });
    expect(opened.success).toBe(true);
    if (!opened.success) return;
    expect(opened.data.reference).toBe(`${queue.key}-1`);
    expect(opened.data.ticket.status).toBe("open");
    expect(opened.data.ticket.priority).toBe("normal");
    const ticketId = opened.data.ticket.id;

    // sequência por fila
    const second = await openTicket({
      queueId: queue.id,
      title: "Tomada solta",
      description: "Tomada da copa está solta.",
      requesterUserId: requester.id,
    });
    expect(second.success && second.data.reference).toBe(`${queue.key}-2`);

    // 2 — anexar foto
    const attached = await addTicketAttachment({ ticketId, mediaIds: [mediaId], uploadedByUserId: requester.id });
    expect(attached.success).toBe(true);

    const attachmentList = await listTicketAttachments(ticketId);
    expect(attachmentList.success).toBe(true);
    if (attachmentList.success) {
      expect(attachmentList.data).toHaveLength(1);
      expect(attachmentList.data[0].mediaUrl).toBe(`https://blob.test/${mediaId}-foto.jpg`);
    }

    // 3 — comentar (nota interna da equipe)
    const commented = await addComment({
      ticketId,
      body: "Técnico a caminho.",
      visibility: "internal",
      authorUserId: agent.id,
      isTeamMember: true,
    });
    expect(commented.success).toBe(true);

    // 4 — atribuir
    const assigned = await assignTicket(
      { ticketId, assigneeUserId: agent.id, actorId: boss.id },
      { queueId: queue.id, currentAssigneeUserId: null },
    );
    expect(assigned.success).toBe(true);
    if (assigned.success) expect(assigned.data.assigneeUserId).toBe(agent.id);

    // guarda: um técnico que NÃO é o responsável e não é gestor não resolve
    const plainAgentCaps: TicketActorCapabilities = {
      hasManagePermission: false,
      isQueueManager: false,
      isAssignee: false,
      isQueueMember: true,
    };
    const deniedResolve = await changeStatus(
      { ticketId, to: "resolved", note: null, actorId: "someone-else" },
      { currentStatus: "open", capabilities: plainAgentCaps },
    );
    expect(deniedResolve.success).toBe(false);
    if (!deniedResolve.success) expect(deniedResolve.error.code).toBe("helpdesk.change-status.resolve_forbidden");

    // 5 — resolver (o responsável)
    const resolved = await changeStatus(
      { ticketId, to: "resolved", note: "Lâmpada trocada.", actorId: agent.id },
      {
        currentStatus: "open",
        capabilities: { hasManagePermission: false, isQueueManager: false, isAssignee: true, isQueueMember: true },
      },
    );
    expect(resolved.success).toBe(true);
    if (resolved.success) expect(resolved.data.resolvedAt).not.toBeNull();

    // guarda: um gestor de fila não fecha
    const deniedClose = await changeStatus(
      { ticketId, to: "closed", note: null, actorId: boss.id },
      {
        currentStatus: "resolved",
        capabilities: { hasManagePermission: false, isQueueManager: true, isAssignee: false, isQueueMember: true },
      },
    );
    expect(deniedClose.success).toBe(false);
    if (!deniedClose.success) expect(deniedClose.error.code).toBe("helpdesk.change-status.close_forbidden");

    // 6 — fechar (helpdesk.manage)
    const closed = await changeStatus(
      { ticketId, to: "closed", note: null, actorId: boss.id },
      {
        currentStatus: "resolved",
        capabilities: { hasManagePermission: true, isQueueManager: false, isAssignee: false, isQueueMember: false },
      },
    );
    expect(closed.success).toBe(true);
    if (closed.success) expect(closed.data.closedAt).not.toBeNull();

    // timeline da equipe: created, comment, assignment, 2× status_change
    const ticket = await findTicketById(ticketId);
    expect(ticket).not.toBeNull();
    if (!ticket) return;

    const teamView = await assembleTicketDetail(ticket, true);
    expect(teamView.success).toBe(true);
    if (!teamView.success) return;
    const kinds = teamView.data.timeline.map((entry) => entry.kind);
    expect(kinds).toEqual(["created", "comment", "assignment", "status_change", "status_change"]);
    expect(teamView.data.attachments).toHaveLength(1);
    expect(teamView.data.ticket.status).toBe("closed");

    // visão do solicitante: sem a nota interna nem a atribuição
    const requesterView = await assembleTicketDetail(ticket, false);
    expect(requesterView.success).toBe(true);
    if (!requesterView.success) return;
    const publicKinds = requesterView.data.timeline.map((entry) => entry.kind);
    expect(publicKinds).toEqual(["created", "status_change", "status_change"]);
  });
});
