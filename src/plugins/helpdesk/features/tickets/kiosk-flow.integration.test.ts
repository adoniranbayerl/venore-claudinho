import { describe, expect, it } from "vitest";
import { seedKiosk, seedQueue, seedQueueMembers, seedUser } from "@/test-support/integration/helpdesk-seed";
import { submitKioskTicketHandler } from "./submit-kiosk-ticket/handler";
import { getTicketByTrackingToken } from "./get-ticket-by-tracking-token/service";
import { findTrackedTicketByToken } from "./get-ticket-by-tracking-token/store";
import { addTrackingComment } from "./add-tracking-comment/service";
import { rateTicket } from "./rate-ticket/service";
import { assignTicket } from "./assign-ticket/service";
import { changeStatus } from "./change-status/service";
import { listNotificationsForUser } from "../../shared/notification-store";

// Fluxo anônimo do quiosque (§2.5), cruzando kiosks + tickets + ticket_events + ticket_counters +
// queue_members + helpdesk_notifications — por isso é teste de integração (docs/chamados-plugin.md
// §7). Cobre: enviar pelo quiosque → acompanhar pelo tracking token → comentar → resolver →
// avaliar.
describe("helpdesk — fluxo do quiosque anônimo (integração)", () => {
  it("envia sem login, acompanha, comenta e avalia pelo tracking token", async () => {
    const boss = await seedUser({ name: "Gestor" });
    const agent = await seedUser({ name: "Técnico" });

    const queue = await seedQueue(boss.id, { name: "Manutenção" });
    await seedQueueMembers(
      queue.id,
      [
        { userId: boss.id, role: "manager" },
        { userId: agent.id, role: "agent" },
      ],
      boss.id,
    );
    const kiosk = await seedKiosk(boss.id, { label: "Recepção", queueId: queue.id, defaultLocation: "Recepção Bloco A" });

    // 1 — enviar pelo quiosque (sem sessão)
    const submitted = await submitKioskTicketHandler({
      token: kiosk.token,
      description: "Totem de pedido travado na tela inicial.",
      location: "Recepção Bloco A",
      requesterName: "Maria da recepção",
      contact: "ramal 32",
    });
    expect(submitted.success).toBe(true);
    if (!submitted.success) return;
    expect(submitted.data.reference).toBe(`${queue.key}-1`);
    const trackingToken = submitted.data.trackingToken;
    expect(trackingToken).toMatch(/^[0-9a-f]{32}$/);

    // a fila foi avisada (`new_ticket`); ninguém é "autor" num envio anônimo
    expect((await listNotificationsForUser(boss.id)).map((n) => n.kind)).toEqual(["new_ticket"]);
    expect((await listNotificationsForUser(agent.id)).map((n) => n.kind)).toEqual(["new_ticket"]);

    // 2 — acompanhar pelo link: timeline pública, sem UUID de usuário
    const track1 = await getTicketByTrackingToken(trackingToken);
    expect(track1.success).toBe(true);
    if (!track1.success) return;
    expect(track1.data.reference).toBe(`${queue.key}-1`);
    expect(track1.data.requesterName).toBe("Maria da recepção");
    expect(track1.data.timeline.map((entry) => entry.kind)).toEqual(["created"]);
    expect(track1.data.timeline[0].authorUserId).toBeNull();
    expect(track1.data.canRate).toBe(false);

    // token malformado → not_found (sem tocar no banco)
    expect((await getTicketByTrackingToken("zzz")).success).toBe(false);

    const tracked = await findTrackedTicketByToken(trackingToken);
    expect(tracked).not.toBeNull();
    if (!tracked) return;
    const ticketId = tracked.id;

    // 3 — comentar pelo link (anônimo)
    const commented = await addTrackingComment({ trackingToken, body: "Ainda está travado, alguém pode vir?" });
    expect(commented.success).toBe(true);

    const track2 = await getTicketByTrackingToken(trackingToken);
    expect(track2.success && track2.data.timeline.map((e) => e.kind)).toEqual(["created", "comment"]);
    // fila recebeu `comment_added`
    expect((await listNotificationsForUser(agent.id)).map((n) => n.kind)).toEqual(["comment_added", "new_ticket"]);

    // 4 — avaliar antes de resolver é bloqueado
    const earlyRate = await rateTicket({ trackingToken, score: 5, comment: null });
    expect(earlyRate.success).toBe(false);
    if (!earlyRate.success) expect(earlyRate.error.code).toBe("helpdesk.rate-ticket.not_resolved");

    // 5 — atribuir e resolver (o responsável)
    const assigned = await assignTicket(
      { ticketId, assigneeUserId: agent.id, actorId: boss.id },
      { queueId: queue.id, currentAssigneeUserId: null },
    );
    expect(assigned.success).toBe(true);

    const resolved = await changeStatus(
      { ticketId, to: "resolved", note: "Reiniciado o totem.", actorId: agent.id },
      {
        currentStatus: "open",
        capabilities: { hasManagePermission: false, isQueueManager: false, isAssignee: true, isQueueMember: true },
      },
    );
    expect(resolved.success).toBe(true);

    // 6 — avaliar pelo link
    const rated = await rateTicket({ trackingToken, score: 5, comment: "Rápido, obrigada!" });
    expect(rated.success).toBe(true);

    const track3 = await getTicketByTrackingToken(trackingToken);
    expect(track3.success).toBe(true);
    if (!track3.success) return;
    expect(track3.data.canRate).toBe(true);
    expect(track3.data.ratingScore).toBe(5);
    expect(track3.data.timeline.map((e) => e.kind)).toContain("rating");
    // o técnico atribuído recebeu `rating_received`
    expect((await listNotificationsForUser(agent.id)).map((n) => n.kind)).toContain("rating_received");
  });
});
