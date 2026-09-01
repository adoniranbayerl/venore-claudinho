import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const insertBoard = vi.fn();
vi.mock("../../../shared/board-store", () => ({
  insertBoard: (...args: unknown[]) => insertBoard(...args),
}));

const isQueueActive = vi.fn();
vi.mock("../../../shared/kiosk-store", () => ({
  isQueueActive: (...args: unknown[]) => isQueueActive(...args),
}));

describe("createBoard", () => {
  beforeEach(() => {
    insertBoard.mockReset();
    isQueueActive.mockReset();
    insertBoard.mockImplementation(async (input: Record<string, unknown>) => ({ id: "b1", ...input }));
  });

  it("cria um painel de todas as filas com token 32-hex e rótulo aparado", async () => {
    const { createBoard } = await import("./service");
    const result = await createBoard({
      label: "  TV da Manutenção  ",
      queueId: null,
      layout: "kanban",
      showAssignee: true,
      refreshSeconds: 20,
      actorId: "mgr",
    });

    expect(result.success).toBe(true);
    const passed = insertBoard.mock.calls[0][0] as { token: string; label: string; queueId: string | null };
    expect(passed.label).toBe("TV da Manutenção");
    expect(passed.queueId).toBeNull();
    expect(passed.token).toMatch(/^[0-9a-f]{32}$/);
    expect(isQueueActive).not.toHaveBeenCalled();
  });

  it("rejeita fila fixada inexistente ou arquivada", async () => {
    isQueueActive.mockResolvedValue(false);

    const { createBoard } = await import("./service");
    const result = await createBoard({
      label: "TV",
      queueId: "gone",
      layout: "open_list",
      showAssignee: false,
      refreshSeconds: 30,
      actorId: "mgr",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.create-board.queue_not_found");
    expect(insertBoard).not.toHaveBeenCalled();
  });

  it("aceita uma fila válida", async () => {
    isQueueActive.mockResolvedValue(true);

    const { createBoard } = await import("./service");
    const result = await createBoard({
      label: "TV",
      queueId: "q1",
      layout: "kanban",
      showAssignee: true,
      refreshSeconds: 15,
      actorId: "mgr",
    });

    expect(result.success).toBe(true);
    expect(insertBoard).toHaveBeenCalledWith(expect.objectContaining({ queueId: "q1", refreshSeconds: 15 }));
  });
});
