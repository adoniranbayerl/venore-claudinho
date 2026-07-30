import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const invalidateCacheByPrefix = vi.fn();
vi.mock("@/infrastructure/cache/memory-cache", () => ({
  invalidateCacheByPrefix: (...args: unknown[]) => invalidateCacheByPrefix(...args),
}));

const findMenuById = vi.fn();
const deleteMenuById = vi.fn();

vi.mock("./store", () => ({
  findMenuById: (...args: unknown[]) => findMenuById(...args),
  deleteMenuById: (...args: unknown[]) => deleteMenuById(...args),
}));

describe("deleteMenu", () => {
  beforeEach(() => {
    findMenuById.mockReset();
    deleteMenuById.mockReset();
    invalidateCacheByPrefix.mockReset();
  });

  it("deletes an existing menu and invalidates the navigation cache", async () => {
    findMenuById.mockResolvedValue({ id: "menu-1", key: "main", name: "Principal", location: "main", scopePath: null });

    const { deleteMenu } = await import("./service");
    const result = await deleteMenu({ id: "menu-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "menu-1" } });
    expect(deleteMenuById).toHaveBeenCalledWith("menu-1");
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("cms:navigation");
  });

  it("fails when the menu does not exist", async () => {
    findMenuById.mockResolvedValue(null);

    const { deleteMenu } = await import("./service");
    const result = await deleteMenu({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "cms.menus.not_found", message: expect.any(String) } });
    expect(deleteMenuById).not.toHaveBeenCalled();
  });
});
