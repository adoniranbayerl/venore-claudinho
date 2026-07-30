import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const invalidateCacheByPrefix = vi.fn();
vi.mock("@/infrastructure/cache/memory-cache", () => ({
  invalidateCacheByPrefix: (...args: unknown[]) => invalidateCacheByPrefix(...args),
}));

const findMenuItemById = vi.fn();
const findMenuItemsByMenuId = vi.fn();
const applyMenuItemPositions = vi.fn();

vi.mock("./store", () => ({
  findMenuItemById: (...args: unknown[]) => findMenuItemById(...args),
  findMenuItemsByMenuId: (...args: unknown[]) => findMenuItemsByMenuId(...args),
  applyMenuItemPositions: (...args: unknown[]) => applyMenuItemPositions(...args),
}));

function item(id: string, parentId: string | null, order = 0) {
  return { id, menuId: "menu-1", parentId, label: id, order, isVisible: true, targetType: "label" as const };
}

describe("moveMenuItem", () => {
  beforeEach(() => {
    findMenuItemById.mockReset();
    findMenuItemsByMenuId.mockReset();
    applyMenuItemPositions.mockReset().mockImplementation(async (updates: unknown[]) => updates);
    invalidateCacheByPrefix.mockReset();
  });

  it("rejects moving an item into its own subtree (cycle protection)", async () => {
    // a -> b -> c. Mover "a" pra dentro de "c" fecharia um ciclo.
    findMenuItemById.mockResolvedValue(item("a", null));
    findMenuItemsByMenuId.mockResolvedValue([item("a", null), item("b", "a"), item("c", "b")]);

    const { moveMenuItem } = await import("./service");
    const result = await moveMenuItem({ id: "a", parentId: "c", order: 0, actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.menus.cycle_detected", message: expect.any(String) },
    });
    expect(applyMenuItemPositions).not.toHaveBeenCalled();
  });

  it("rejects a move that would exceed the max depth", async () => {
    // e é folha solta; a-b-c-d já está no limite de profundidade (4). Mover e pra baixo de d
    // criaria profundidade 5.
    findMenuItemById.mockResolvedValue(item("e", null));
    findMenuItemsByMenuId.mockResolvedValue([
      item("a", null),
      item("b", "a"),
      item("c", "b"),
      item("d", "c"),
      item("e", null),
    ]);

    const { moveMenuItem } = await import("./service");
    const result = await moveMenuItem({ id: "e", parentId: "d", order: 0, actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.menus.max_depth_exceeded", message: expect.any(String) },
    });
    expect(applyMenuItemPositions).not.toHaveBeenCalled();
  });

  it("reindexes both origin and destination siblings when moving across parents", async () => {
    findMenuItemById.mockResolvedValue(item("c", "p1", 0));
    findMenuItemsByMenuId.mockResolvedValue([
      item("p1", null),
      item("p2", null),
      item("c", "p1", 0),
      item("d", "p1", 1),
      item("e", "p2", 0),
    ]);

    const { moveMenuItem } = await import("./service");
    const result = await moveMenuItem({ id: "c", parentId: "p2", order: 1, actorId: "actor-1" });

    expect(result.success).toBe(true);
    const updates = applyMenuItemPositions.mock.calls[0][0];
    expect(updates).toEqual(
      expect.arrayContaining([
        { id: "e", parentId: "p2", order: 0 },
        { id: "c", parentId: "p2", order: 1 },
        { id: "d", parentId: "p1", order: 0 },
      ]),
    );
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("cms:navigation");
  });
});
