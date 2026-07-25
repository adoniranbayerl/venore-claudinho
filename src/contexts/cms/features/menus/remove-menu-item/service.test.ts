import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findMenuItemById = vi.fn();
const deleteMenuItemById = vi.fn();

vi.mock("./store", () => ({
  findMenuItemById: (...args: unknown[]) => findMenuItemById(...args),
  deleteMenuItemById: (...args: unknown[]) => deleteMenuItemById(...args),
}));

describe("removeMenuItem", () => {
  beforeEach(() => {
    findMenuItemById.mockReset();
    deleteMenuItemById.mockReset();
  });

  it("fails when the menu item does not exist", async () => {
    findMenuItemById.mockResolvedValue(null);

    const { removeMenuItem } = await import("./service");
    const result = await removeMenuItem({ menuItemId: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.menus.item_not_found", message: expect.any(String) },
    });
    expect(deleteMenuItemById).not.toHaveBeenCalled();
  });

  it("removes the item when it exists", async () => {
    findMenuItemById.mockResolvedValue({
      id: "item-1",
      menuId: "menu-1",
      label: "Home",
      href: "/",
      order: 0,
      createdAt: new Date(),
    });

    const { removeMenuItem } = await import("./service");
    const result = await removeMenuItem({ menuItemId: "item-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "item-1" } });
    expect(deleteMenuItemById).toHaveBeenCalledWith("item-1");
  });
});
