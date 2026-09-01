import { describe, expect, it } from "vitest";
import { seedQueue, seedQueueMembers, seedUser } from "@/test-support/integration/helpdesk-seed";
import { openTicket } from "../tickets/open-ticket/service";
import { assignTicket } from "../tickets/assign-ticket/service";
import { changeStatus } from "../tickets/change-status/service";
import { createBoard } from "./create-board/service";
import { getBoardFeed } from "./get-board-feed/service";
import { getBoard } from "./get-board/service";

// Painel de TV (§2.6), cruzando boards + tickets + ticket_events + ticket_counters + queue_members
// + a resolução de nome via contexts/auth — por isso é teste de integração (docs/chamados-plugin.md
// §7). Cobre: criar painel → abrir/atribuir/mover/resolver chamados → ler o feed (kanban e
// open_list) por token, sem sessão.
describe("helpdesk — painel de TV (integração)", () => {
  it("monta o feed do painel por token, com colunas por status e o responsável resolvido", async () => {
    const boss = await seedUser({ name: "Gestora" });
    const agent = await seedUser({ name: "Carlos Técnico" });
    const requester = await seedUser({ name: "Solicitante" });

    const queue = await seedQueue(boss.id, { name: "Manutenção" });
    await seedQueueMembers(
      queue.id,
      [
        { userId: boss.id, role: "manager" },
        { userId: agent.id, role: "agent" },
      ],
      boss.id,
    );

    const openOne = await openTicket({
      queueId: queue.id,
      title: "Lâmpada queimada",
      description: "Corredor do 2º andar.",
      requesterUserId: requester.id,
    });
    const inProgress = await openTicket({
      queueId: queue.id,
      title: "Ar-condicionado pingando",
      description: "Sala de reunião.",
      requesterUserId: requester.id,
    });
    const done = await openTicket({
      queueId: queue.id,
      title: "Porta emperrada",
      description: "Almoxarifado.",
      requesterUserId: requester.id,
    });
    if (!openOne.success || !inProgress.success || !done.success) throw new Error("seed de chamados falhou");

    // atribui + move um para in_progress e resolve outro
    await assignTicket(
      { ticketId: inProgress.data.ticket.id, assigneeUserId: agent.id, actorId: boss.id },
      { queueId: queue.id, currentAssigneeUserId: null },
    );
    await changeStatus(
      { ticketId: inProgress.data.ticket.id, to: "in_progress", note: null, actorId: agent.id },
      {
        currentStatus: "open",
        capabilities: { hasManagePermission: false, isQueueManager: false, isAssignee: true, isQueueMember: true },
      },
    );
    await changeStatus(
      { ticketId: done.data.ticket.id, to: "resolved", note: "Lubrificada.", actorId: boss.id },
      {
        currentStatus: "open",
        capabilities: { hasManagePermission: true, isQueueManager: true, isAssignee: false, isQueueMember: true },
      },
    );

    // painel de todas as filas, kanban
    const created = await createBoard({
      label: "TV Manutenção",
      queueId: null,
      layout: "kanban",
      showAssignee: true,
      refreshSeconds: 20,
      actorId: boss.id,
    });
    expect(created.success).toBe(true);
    if (!created.success) return;

    const shell = await getBoard(created.data.token);
    expect(shell.success && shell.data.label).toBe("TV Manutenção");
    expect(shell.success && shell.data.queueName).toBeNull();

    const feed = await getBoardFeed(created.data.token);
    expect(feed.success).toBe(true);
    if (!feed.success) return;

    expect(feed.data.columns.map((c) => c.key)).toEqual(["open", "in_progress", "waiting", "resolved"]);
    const byKey = Object.fromEntries(feed.data.columns.map((c) => [c.key, c]));
    expect(byKey.open.tickets.map((t) => t.title)).toContain("Lâmpada queimada");
    expect(byKey.in_progress.tickets[0].title).toBe("Ar-condicionado pingando");
    expect(byKey.in_progress.tickets[0].assigneeName).toBe("Carlos Técnico");
    expect(byKey.resolved.tickets[0].title).toBe("Porta emperrada");
    expect(feed.data.counts).toMatchObject({ open: 1, inProgress: 1, waiting: 0, resolved: 1, total: 3 });

    // token inválido → not_found
    expect((await getBoardFeed("zzz")).success).toBe(false);
  });

  it("open_list recorta na fila do painel e esconde os resolvidos", async () => {
    const boss = await seedUser({ name: "Gestora TI" });
    const requester = await seedUser({ name: "Pessoa" });
    const ti = await seedQueue(boss.id, { name: "TI" });
    const outra = await seedQueue(boss.id, { name: "Zeladoria" });

    const a = await openTicket({ queueId: ti.id, title: "PC não liga", description: "Sala 3.", requesterUserId: requester.id });
    await openTicket({ queueId: outra.id, title: "Fora do escopo", description: "Outra fila.", requesterUserId: requester.id });
    if (!a.success) throw new Error("seed falhou");
    await changeStatus(
      { ticketId: a.data.ticket.id, to: "resolved", note: null, actorId: boss.id },
      {
        currentStatus: "open",
        capabilities: { hasManagePermission: true, isQueueManager: true, isAssignee: false, isQueueMember: true },
      },
    );
    const b = await openTicket({ queueId: ti.id, title: "Mouse quebrado", description: "Recepção.", requesterUserId: requester.id });
    if (!b.success) throw new Error("seed falhou");

    const board = await createBoard({
      label: "Oficina TI",
      queueId: ti.id,
      layout: "open_list",
      showAssignee: false,
      refreshSeconds: 30,
      actorId: boss.id,
    });
    if (!board.success) return;

    const feed = await getBoardFeed(board.data.token);
    expect(feed.success).toBe(true);
    if (!feed.success) return;
    expect(feed.data.columns).toHaveLength(1);
    expect(feed.data.columns[0].key).toBe("pending");
    const titles = feed.data.columns[0].tickets.map((t) => t.title);
    expect(titles).toEqual(["Mouse quebrado"]); // resolvido some, outra fila não entra
    expect(feed.data.queueName).toBe("TI");
  });
});
