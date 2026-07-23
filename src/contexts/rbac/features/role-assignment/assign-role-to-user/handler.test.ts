import { beforeEach, describe, expect, it, vi } from "vitest";

const assignRoleToUser = vi.fn();

vi.mock("./service", () => ({
  assignRoleToUser: (...args: unknown[]) => assignRoleToUser(...args),
}));

const authorizeActor = vi.fn();

vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

describe("assignRoleToUserHandler", () => {
  beforeEach(() => {
    assignRoleToUser.mockReset();
    authorizeActor.mockReset();
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
  });

  it("rejects an empty userId or roleId without checking authorization", async () => {
    const { assignRoleToUserHandler } = await import("./handler");
    const result = await assignRoleToUserHandler({ userId: "", roleId: "role-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_id", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
    expect(assignRoleToUser).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated actor", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.unauthenticated", message: "sem sessão" },
    });

    const { assignRoleToUserHandler } = await import("./handler");
    const result = await assignRoleToUserHandler({ userId: "user-1", roleId: "role-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.unauthenticated", message: "sem sessão" },
    });
    expect(assignRoleToUser).not.toHaveBeenCalled();
  });

  it("rejects an actor without rbac.roles.assign", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });

    const { assignRoleToUserHandler } = await import("./handler");
    const result = await assignRoleToUserHandler({ userId: "user-1", roleId: "role-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });
    expect(authorizeActor).toHaveBeenCalledWith("rbac.roles.assign");
    expect(assignRoleToUser).not.toHaveBeenCalled();
  });

  it("delegates to the service with the resolved actor when authorized", async () => {
    assignRoleToUser.mockResolvedValue({ success: true, data: undefined });

    const { assignRoleToUserHandler } = await import("./handler");
    const result = await assignRoleToUserHandler({ userId: "user-1", roleId: "role-1" });

    expect(assignRoleToUser).toHaveBeenCalledWith({ userId: "user-1", roleId: "role-1", actor: { id: "actor-1" } });
    expect(result).toEqual({ success: true, data: undefined });
  });
});
