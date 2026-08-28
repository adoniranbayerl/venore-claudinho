import { describe, expect, it } from "vitest";
import { toUserRbacContext } from "./view";
import type { UserRoleRow, UserScopeRow } from "./store";

function roleRow(overrides: Partial<UserRoleRow> = {}): UserRoleRow {
  return {
    roleId: "role-1",
    roleKey: "editor",
    roleName: "Editor",
    roleIsSystem: true,
    permissionKey: "cms.entries.manage",
    ...overrides,
  };
}

describe("toUserRbacContext — scopedPermissions", () => {
  it("marks a granted scopable key as global when the assignment has no scope rows", () => {
    const context = toUserRbacContext("user-1", [roleRow()], []);

    expect(context.scopedPermissions).toEqual({ "cms.entries.manage": { "cms.category": "global" } });
    expect(context.permissions).toEqual(["cms.entries.manage"]);
  });

  it("keeps a non-scopable permission out of scopedPermissions entirely", () => {
    const context = toUserRbacContext(
      "user-1",
      [roleRow({ permissionKey: "rbac.roles.manage" })],
      [{ roleId: "role-1", scopeType: "cms.category", resourceId: "cat-a" }],
    );

    expect(context.scopedPermissions).toEqual({});
  });

  it("narrows a lone scoped role to its resource ids for every scopable key it grants", () => {
    const roleRows: UserRoleRow[] = [
      roleRow({ roleId: "role-ed", permissionKey: "cms.entries.manage" }),
      roleRow({ roleId: "role-ed", permissionKey: "cms.entries.publish" }),
      roleRow({ roleId: "role-ed", permissionKey: "cms.categories.manage" }),
    ];
    const scopeRows: UserScopeRow[] = [
      { roleId: "role-ed", scopeType: "cms.category", resourceId: "cat-b" },
      { roleId: "role-ed", scopeType: "cms.category", resourceId: "cat-a" },
    ];

    const context = toUserRbacContext("user-1", roleRows, scopeRows);

    expect(context.scopedPermissions).toEqual({
      "cms.entries.manage": { "cms.category": ["cat-a", "cat-b"] },
      "cms.entries.publish": { "cms.category": ["cat-a", "cat-b"] },
      "cms.categories.manage": { "cms.category": ["cat-a", "cat-b"] },
    });
  });

  it("lets a global role win over a scoped role granting the same key (union → global)", () => {
    const roleRows: UserRoleRow[] = [
      roleRow({ roleId: "role-admin", roleKey: "admin", permissionKey: "cms.entries.manage" }),
      roleRow({ roleId: "role-ed", roleKey: "editor", permissionKey: "cms.entries.manage" }),
    ];
    const scopeRows: UserScopeRow[] = [{ roleId: "role-ed", scopeType: "cms.category", resourceId: "cat-a" }];

    const context = toUserRbacContext("user-1", roleRows, scopeRows);

    expect(context.scopedPermissions["cms.entries.manage"]["cms.category"]).toBe("global");
  });

  it("unions resource ids across two scoped roles granting the same key", () => {
    const roleRows: UserRoleRow[] = [
      roleRow({ roleId: "role-a", permissionKey: "cms.entries.manage" }),
      roleRow({ roleId: "role-b", permissionKey: "cms.entries.manage" }),
    ];
    const scopeRows: UserScopeRow[] = [
      { roleId: "role-a", scopeType: "cms.category", resourceId: "cat-1" },
      { roleId: "role-b", scopeType: "cms.category", resourceId: "cat-2" },
    ];

    const context = toUserRbacContext("user-1", roleRows, scopeRows);

    expect(context.scopedPermissions["cms.entries.manage"]["cms.category"]).toEqual(["cat-1", "cat-2"]);
  });

  it("treats a role whose scope rows belong to a different assignment as global", () => {
    const roleRows: UserRoleRow[] = [roleRow({ roleId: "role-ed", permissionKey: "cms.entries.manage" })];
    // scope row is for a role the user does not carry here → contributes nothing to role-ed.
    const scopeRows: UserScopeRow[] = [{ roleId: "role-other", scopeType: "cms.category", resourceId: "cat-x" }];

    const context = toUserRbacContext("user-1", roleRows, scopeRows);

    expect(context.scopedPermissions["cms.entries.manage"]["cms.category"]).toBe("global");
  });

  it("does not special-case superadmin here — scopedPermissions only reflects granted keys", () => {
    const context = toUserRbacContext(
      "user-1",
      [roleRow({ roleId: "role-super", roleKey: "superadmin", permissionKey: null })],
      [],
    );

    expect(context.isSuperadmin).toBe(true);
    expect(context.scopedPermissions).toEqual({});
  });
});
