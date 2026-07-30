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
const deleteMenuItemById = vi.fn();

vi.mock("./store", () => ({
  findMenuItemById: (...args: unknown[]) => findMenuItemById(...args),
  deleteMenuItemById: (...args: unknown[]) => deleteMenuItemById(...args),
}));

describe("removeMenuItem", () => {
  beforeEach(() => {
    findMenuItemById.mockReset();
    deleteMenuItemById.mockReset();
    invalidateCacheByPrefix.mockReset();
  });

  it("removes an existing item and invalidates the navigation cache", async () => {
    findMenuItemById.mockResolvedValue({ id: "item-1", menuId: "menu-1", parentId: null, label: "x", order: 0, isVisible: true, targetType: "label" });

    const { removeMenuItem } = await import("./service");
    const result = await removeMenuItem({ id: "item-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "item-1" } });
    expect(deleteMenuItemById).toHaveBeenCalledWith("item-1");
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("cms:navigation");
  });

  it("fails when the item does not exist", async () => {
    findMenuItemById.mockResolvedValue(null);

    const { removeMenuItem } = await import("./service");
    const result = await removeMenuItem({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "cms.menus.item_not_found", message: expect.any(String) } });
    expect(deleteMenuItemById).not.toHaveBeenCalled();
  });
});
