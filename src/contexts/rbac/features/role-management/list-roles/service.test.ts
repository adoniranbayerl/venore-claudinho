import { beforeEach, describe, expect, it, vi } from "vitest";

const findAllRolesWithPermissions = vi.fn();

vi.mock("./store", () => ({
  findAllRolesWithPermissions: (...args: unknown[]) => findAllRolesWithPermissions(...args),
}));

describe("listRoles", () => {
  beforeEach(() => {
    findAllRolesWithPermissions.mockReset();
  });

  it("maps roles with their permission keys", async () => {
    findAllRolesWithPermissions.mockResolvedValue([
      { id: "role-1", key: "superadmin", name: "Superadmin", isSystem: true, permissionKeys: [] },
      { id: "role-2", key: "editor", name: "Editor", isSystem: false, permissionKeys: ["cms.entries.manage"] },
    ]);

    const { listRoles } = await import("./service");
    const result = await listRoles();

    expect(result).toEqual({
      success: true,
      data: [
        { id: "role-1", key: "superadmin", name: "Superadmin", isSystem: true, permissionKeys: [] },
        { id: "role-2", key: "editor", name: "Editor", isSystem: false, permissionKeys: ["cms.entries.manage"] },
      ],
    });
  });
});
