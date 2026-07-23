import { beforeEach, describe, expect, it, vi } from "vitest";

const removeRoleFromUser = vi.fn();

vi.mock("./service", () => ({
  removeRoleFromUser: (...args: unknown[]) => removeRoleFromUser(...args),
}));

const authorizeActor = vi.fn();

vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

describe("removeRoleFromUserHandler", () => {
  beforeEach(() => {
    removeRoleFromUser.mockReset();
    authorizeActor.mockReset();
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
  });

  it("rejects an empty userId or roleId without checking authorization", async () => {
    const { removeRoleFromUserHandler } = await import("./handler");
    const result = await removeRoleFromUserHandler({ userId: "user-1", roleId: "" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_id", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
    expect(removeRoleFromUser).not.toHaveBeenCalled();
  });

  it("rejects an actor without rbac.roles.assign", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });

    const { removeRoleFromUserHandler } = await import("./handler");
    const result = await removeRoleFromUserHandler({ userId: "user-1", roleId: "role-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });
    expect(authorizeActor).toHaveBeenCalledWith("rbac.roles.assign");
    expect(removeRoleFromUser).not.toHaveBeenCalled();
  });

  it("delegates to the service with the resolved actor when authorized", async () => {
    removeRoleFromUser.mockResolvedValue({ success: true, data: undefined });

    const { removeRoleFromUserHandler } = await import("./handler");
    const result = await removeRoleFromUserHandler({ userId: "user-1", roleId: "role-1" });

    expect(removeRoleFromUser).toHaveBeenCalledWith({ userId: "user-1", roleId: "role-1", actor: { id: "actor-1" } });
    expect(result).toEqual({ success: true, data: undefined });
  });
});
