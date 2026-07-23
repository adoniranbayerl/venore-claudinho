import { beforeEach, describe, expect, it, vi } from "vitest";

const updateRolePermissions = vi.fn();

vi.mock("./service", () => ({
  updateRolePermissions: (...args: unknown[]) => updateRolePermissions(...args),
}));

const authorizeActor = vi.fn();

vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

describe("updateRolePermissionsHandler", () => {
  beforeEach(() => {
    updateRolePermissions.mockReset();
    authorizeActor.mockReset();
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
  });

  it("rejects an empty roleId without checking authorization", async () => {
    const { updateRolePermissionsHandler } = await import("./handler");
    const result = await updateRolePermissionsHandler({ roleId: "", permissionKeys: [] });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_id", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
    expect(updateRolePermissions).not.toHaveBeenCalled();
  });

  it("rejects a non-array permissionKeys without checking authorization", async () => {
    const { updateRolePermissionsHandler } = await import("./handler");
    // @ts-expect-error deliberately invalid shape
    const result = await updateRolePermissionsHandler({ roleId: "role-1", permissionKeys: "not-an-array" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_permissions", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("rejects an actor without rbac.roles.manage", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });

    const { updateRolePermissionsHandler } = await import("./handler");
    const result = await updateRolePermissionsHandler({ roleId: "role-1", permissionKeys: [] });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });
    expect(authorizeActor).toHaveBeenCalledWith("rbac.roles.manage");
    expect(updateRolePermissions).not.toHaveBeenCalled();
  });

  it("delegates to the service with the resolved actor when authorized", async () => {
    updateRolePermissions.mockResolvedValue({
      success: true,
      data: { id: "role-1", key: "editor", name: "Editor", isSystem: false },
    });

    const { updateRolePermissionsHandler } = await import("./handler");
    const result = await updateRolePermissionsHandler({ roleId: "role-1", permissionKeys: ["cms.entries.manage"] });

    expect(updateRolePermissions).toHaveBeenCalledWith({
      roleId: "role-1",
      permissionKeys: ["cms.entries.manage"],
      actor: { id: "actor-1" },
    });
    expect(result.success).toBe(true);
  });
});
