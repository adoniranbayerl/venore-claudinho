import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
const resolveScopeForActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
  resolveScopeForActor: (...args: unknown[]) => resolveScopeForActor(...args),
}));

const listCategoriesForAdmin = vi.fn();
vi.mock("./service", () => ({
  listCategoriesForAdmin: (...args: unknown[]) => listCategoriesForAdmin(...args),
}));

describe("listCategoriesForAdminHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    resolveScopeForActor.mockReset();
    listCategoriesForAdmin.mockReset().mockResolvedValue({ success: true, data: [] });
  });

  it("propagates the authorization error", async () => {
    authorizeActor.mockResolvedValue({ authorized: false, error: { code: "rbac.authorization.forbidden", message: "x" } });

    const { listCategoriesForAdminHandler } = await import("./handler");
    const result = await listCategoriesForAdminHandler();

    expect(result.success).toBe(false);
    expect(listCategoriesForAdmin).not.toHaveBeenCalled();
  });

  it("returns the whole catalog when any key is global", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    resolveScopeForActor.mockImplementation(async (_actor: string, key: string) =>
      key === "cms.categories.manage" ? { kind: "none" } : { kind: "global" },
    );

    const { listCategoriesForAdminHandler } = await import("./handler");
    await listCategoriesForAdminHandler();

    expect(listCategoriesForAdmin).toHaveBeenCalledWith({});
  });

  it("unions the scoped ids across keys for a scoped editor", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    resolveScopeForActor.mockImplementation(async (_actor: string, key: string) =>
      key === "cms.categories.manage"
        ? { kind: "scoped", resourceIds: ["cat-a"] }
        : { kind: "scoped", resourceIds: ["cat-a", "cat-b"] },
    );

    const { listCategoriesForAdminHandler } = await import("./handler");
    await listCategoriesForAdminHandler();

    const call = listCategoriesForAdmin.mock.calls[0][0];
    expect(new Set(call.allowedCategoryIds)).toEqual(new Set(["cat-a", "cat-b"]));
  });
});
