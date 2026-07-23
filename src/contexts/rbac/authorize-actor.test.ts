import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const getUserContext = vi.fn();

vi.mock("@/contexts/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock("./features/role-assignment/get-user-context/service", () => ({
  getUserContext: (...args: unknown[]) => getUserContext(...args),
}));

describe("authorizeActor", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    getUserContext.mockReset();
  });

  it("rejects when there is no authenticated user", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("rbac.roles.assign");

    expect(result).toEqual({
      authorized: false,
      error: { code: "rbac.authorization.unauthenticated", message: expect.any(String) },
    });
    expect(getUserContext).not.toHaveBeenCalled();
  });

  it("rejects when the actor lacks the required permission", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: ["cms.entries.manage"], isSuperadmin: false },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("rbac.roles.assign");

    expect(result).toEqual({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: expect.any(String) },
    });
  });

  it("authorizes when the actor has the required permission", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: ["rbac.roles.assign"], isSuperadmin: false },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("rbac.roles.assign");

    expect(result).toEqual({ authorized: true, actorId: "user-1" });
  });

  it("bypasses the permission check for a superadmin", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: [], isSuperadmin: true },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("rbac.roles.assign");

    expect(result).toEqual({ authorized: true, actorId: "user-1" });
  });

  it("propagates a failure from getUserContext", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: false,
      error: { code: "rbac.roles.invalid_id", message: "userId não pode ser vazio." },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("rbac.roles.assign");

    expect(result).toEqual({
      authorized: false,
      error: { code: "rbac.roles.invalid_id", message: expect.any(String) },
    });
  });
});
