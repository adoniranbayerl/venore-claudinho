import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
const resolveScopeForActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
  resolveScopeForActor: (...args: unknown[]) => resolveScopeForActor(...args),
}));

const listEntriesForAdmin = vi.fn();
vi.mock("./service", () => ({
  listEntriesForAdmin: (...args: unknown[]) => listEntriesForAdmin(...args),
}));

describe("listEntriesForAdminHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    resolveScopeForActor.mockReset();
    listEntriesForAdmin.mockReset().mockResolvedValue({ success: true, data: [] });
  });

  it("propagates the authorization error without resolving scope", async () => {
    authorizeActor.mockResolvedValue({ authorized: false, error: { code: "rbac.authorization.forbidden", message: "x" } });

    const { listEntriesForAdminHandler } = await import("./handler");
    const result = await listEntriesForAdminHandler();

    expect(result.success).toBe(false);
    expect(resolveScopeForActor).not.toHaveBeenCalled();
    expect(listEntriesForAdmin).not.toHaveBeenCalled();
  });

  it("does not filter for a global actor", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    resolveScopeForActor.mockResolvedValue({ kind: "global" });

    const { listEntriesForAdminHandler } = await import("./handler");
    await listEntriesForAdminHandler({ status: "draft" });

    expect(listEntriesForAdmin).toHaveBeenCalledWith({ status: "draft", allowedCategoryIds: undefined });
  });

  it("injects the scoped category ids for a scoped editor", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    resolveScopeForActor.mockResolvedValue({ kind: "scoped", resourceIds: ["cat-a", "cat-b"] });

    const { listEntriesForAdminHandler } = await import("./handler");
    await listEntriesForAdminHandler();

    expect(listEntriesForAdmin).toHaveBeenCalledWith({ allowedCategoryIds: ["cat-a", "cat-b"] });
  });

  it("returns 403 when the actor resolves to no scope at all", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    resolveScopeForActor.mockResolvedValue({ kind: "none" });

    const { listEntriesForAdminHandler } = await import("./handler");
    const result = await listEntriesForAdminHandler();

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: expect.any(String) },
    });
    expect(listEntriesForAdmin).not.toHaveBeenCalled();
  });
});
