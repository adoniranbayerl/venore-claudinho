import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findMenuItemsByMenuId = vi.fn();
const updateMenuItemsOrder = vi.fn();

vi.mock("./store", () => ({
  findMenuItemsByMenuId: (...args: unknown[]) => findMenuItemsByMenuId(...args),
  updateMenuItemsOrder: (...args: unknown[]) => updateMenuItemsOrder(...args),
}));

function item(id: string, order: number) {
  return { id, menuId: "menu-1", label: id, href: `/${id}`, order, createdAt: new Date() };
}

describe("reorderMenuItems", () => {
  beforeEach(() => {
    findMenuItemsByMenuId.mockReset();
    updateMenuItemsOrder.mockReset();
  });

  it("reorders items when the incoming ids match the existing set", async () => {
    findMenuItemsByMenuId.mockResolvedValue([item("a", 0), item("b", 1)]);
    updateMenuItemsOrder.mockResolvedValue([item("b", 0), item("a", 1)]);

    const { reorderMenuItems } = await import("./service");
    const result = await reorderMenuItems({ menuId: "menu-1", menuItemIds: ["b", "a"], actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(updateMenuItemsOrder).toHaveBeenCalledWith("menu-1", ["b", "a"]);
  });

  it("fails when the incoming ids do not match the existing set", async () => {
    findMenuItemsByMenuId.mockResolvedValue([item("a", 0), item("b", 1)]);

    const { reorderMenuItems } = await import("./service");
    const result = await reorderMenuItems({ menuId: "menu-1", menuItemIds: ["a", "c"], actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.menus.reorder_mismatch", message: expect.any(String) },
    });
    expect(updateMenuItemsOrder).not.toHaveBeenCalled();
  });
});
