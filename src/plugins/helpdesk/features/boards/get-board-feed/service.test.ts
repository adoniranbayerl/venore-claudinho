import { beforeEach, describe, expect, it, vi } from "vitest";

const findBoardByToken = vi.fn();
const findQueueNameById = vi.fn();
vi.mock("../../../shared/board-store", () => ({
  findBoardByToken: (...args: unknown[]) => findBoardByToken(...args),
  findQueueNameById: (...args: unknown[]) => findQueueNameById(...args),
}));

const findTicketListItems = vi.fn();
vi.mock("../../../shared/ticket-list-store", () => ({
  findTicketListItems: (...args: unknown[]) => findTicketListItems(...args),
}));

const listUsers = vi.fn();
vi.mock("@/contexts/auth", () => ({
  listUsers: (...args: unknown[]) => listUsers(...args),
}));

const TOKEN = "a".repeat(32);

function board(overrides: Record<string, unknown> = {}) {
  return {
    id: "b1",
    token: TOKEN,
    label: "TV da Manutenção",
    queueId: null,
    layout: "kanban",
    showAssignee: true,
    refreshSeconds: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function listItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "t1",
    reference: "manutencao-1",
    queueId: "q1",
    queueName: "Manutenção",
    seq: 1,
    title: "Vazamento",
    status: "open",
    priority: "normal",
    categoryLabel: null,
    location: null,
    assigneeUserId: null,
    requesterUserId: null,
    slaDueAt: null,
    slaState: "none",
    createdAt: new Date("2026-09-01T12:00:00Z"),
    updatedAt: new Date("2026-09-01T12:00:00Z"),
    ...overrides,
  };
}

describe("getBoardFeed", () => {
  beforeEach(() => {
    findBoardByToken.mockReset();
    findQueueNameById.mockReset();
    findTicketListItems.mockReset();
    listUsers.mockReset();
  });

  it("token malformado → not_found, sem tocar no store", async () => {
    const { getBoardFeed } = await import("./service");
    const result = await getBoardFeed("nope");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.get-board-feed.not_found");
    expect(findBoardByToken).not.toHaveBeenCalled();
  });

  it("painel inexistente → not_found", async () => {
    findBoardByToken.mockResolvedValue(null);
    const { getBoardFeed } = await import("./service");
    const result = await getBoardFeed(TOKEN);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.get-board-feed.not_found");
  });

  it("painel de todas as filas: não filtra por fila, monta o kanban e resolve o responsável", async () => {
    findBoardByToken.mockResolvedValue(board());
    findTicketListItems.mockResolvedValue([
      listItem({ id: "t1", status: "open", assigneeUserId: "u1" }),
      listItem({ id: "t2", status: "in_progress" }),
    ]);
    listUsers.mockResolvedValue({ success: true, data: [{ id: "u1", name: "Ana Paula", email: "ana@x.com" }] });

    const { getBoardFeed } = await import("./service");
    const result = await getBoardFeed(TOKEN);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(findTicketListItems).toHaveBeenCalledWith(
      expect.objectContaining({ queueIds: undefined, statuses: ["open", "in_progress", "waiting", "resolved"] }),
    );
    expect(result.data.layout).toBe("kanban");
    expect(result.data.queueName).toBeNull();
    const openCol = result.data.columns.find((c) => c.key === "open");
    expect(openCol?.tickets[0].assigneeName).toBe("Ana Paula");
    expect(result.data.counts.total).toBe(2);
  });

  it("painel de uma fila com showAssignee=false: filtra pela fila e não chama listUsers", async () => {
    findBoardByToken.mockResolvedValue(board({ queueId: "q1", showAssignee: false }));
    findQueueNameById.mockResolvedValue("Manutenção");
    findTicketListItems.mockResolvedValue([listItem({ assigneeUserId: "u1" })]);

    const { getBoardFeed } = await import("./service");
    const result = await getBoardFeed(TOKEN);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(findTicketListItems).toHaveBeenCalledWith(expect.objectContaining({ queueIds: ["q1"] }));
    expect(result.data.queueName).toBe("Manutenção");
    expect(listUsers).not.toHaveBeenCalled();
    expect(result.data.columns[0].tickets[0].assigneeName).toBeNull();
  });
});
