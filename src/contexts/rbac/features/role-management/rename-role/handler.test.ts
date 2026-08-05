import { beforeEach, describe, expect, it, vi } from "vitest";

const renameRole = vi.fn();

vi.mock("./service", () => ({
  renameRole: (...args: unknown[]) => renameRole(...args),
}));

const authorizeActor = vi.fn();

vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

describe("renameRoleHandler", () => {
  beforeEach(() => {
    renameRole.mockReset();
    authorizeActor.mockReset();
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
  });

  it("rejects an empty roleId without checking authorization", async () => {
    const { renameRoleHandler } = await import("./handler");
    const result = await renameRoleHandler({ roleId: "", name: "Overlord" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_id", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
    expect(renameRole).not.toHaveBeenCalled();
  });

  it("rejects an empty name without checking authorization", async () => {
    const { renameRoleHandler } = await import("./handler");
    const result = await renameRoleHandler({ roleId: "role-1", name: "   " });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_name", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
    expect(renameRole).not.toHaveBeenCalled();
  });

  it("rejects an actor without rbac.roles.manage", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });

    const { renameRoleHandler } = await import("./handler");
    const result = await renameRoleHandler({ roleId: "role-1", name: "Overlord" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });
    expect(authorizeActor).toHaveBeenCalledWith("rbac.roles.manage");
    expect(renameRole).not.toHaveBeenCalled();
  });

  it("delegates to the service with the resolved actor when authorized, including system roles", async () => {
    renameRole.mockResolvedValue({
      success: true,
      data: { id: "role-1", key: "superadmin", name: "Overlord", isSystem: true },
    });

    const { renameRoleHandler } = await import("./handler");
    const result = await renameRoleHandler({ roleId: "role-1", name: "Overlord" });

    expect(renameRole).toHaveBeenCalledWith({
      roleId: "role-1",
      name: "Overlord",
      actor: { id: "actor-1" },
    });
    expect(result.success).toBe(true);
  });
});
