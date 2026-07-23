import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRoleRow } from "./store";

const findUserRoleRows = vi.fn();

vi.mock("./store", () => ({
  findUserRoleRows: (...args: unknown[]) => findUserRoleRows(...args),
}));

const getCachedUserContext = vi.fn();
const setCachedUserContext = vi.fn();

vi.mock("../../../user-context-cache", () => ({
  getCachedUserContext: (...args: unknown[]) => getCachedUserContext(...args),
  setCachedUserContext: (...args: unknown[]) => setCachedUserContext(...args),
}));

describe("getUserContext", () => {
  beforeEach(() => {
    findUserRoleRows.mockReset();
    getCachedUserContext.mockReset();
    setCachedUserContext.mockReset();
  });

  it("returns the cached context without touching the store on a cache hit", async () => {
    const cached = { userId: "user-1", roles: [], permissions: ["cms.entries.manage"], isSuperadmin: false };
    getCachedUserContext.mockReturnValue(cached);

    const { getUserContext } = await import("./service");
    const result = await getUserContext({ userId: "user-1" });

    expect(result).toEqual({ success: true, data: cached });
    expect(findUserRoleRows).not.toHaveBeenCalled();
    expect(setCachedUserContext).not.toHaveBeenCalled();
  });

  it("falls back to the store on a cache miss and populates the cache", async () => {
    getCachedUserContext.mockReturnValue(null);
    const rows: UserRoleRow[] = [
      { roleId: "role-1", roleKey: "editor", roleName: "Editor", roleIsSystem: false, permissionKey: "cms.entries.manage" },
    ];
    findUserRoleRows.mockResolvedValue(rows);

    const { getUserContext } = await import("./service");
    const result = await getUserContext({ userId: "user-1" });

    expect(result.success).toBe(true);
    expect(findUserRoleRows).toHaveBeenCalledWith("user-1");
    expect(setCachedUserContext).toHaveBeenCalledWith("user-1", result.success ? result.data : undefined);
  });

  it("unions permissions across all assigned roles without duplicates", async () => {
    getCachedUserContext.mockReturnValue(null);
    const rows: UserRoleRow[] = [
      { roleId: "role-1", roleKey: "editor", roleName: "Editor", roleIsSystem: false, permissionKey: "cms.entries.manage" },
      { roleId: "role-1", roleKey: "editor", roleName: "Editor", roleIsSystem: false, permissionKey: "cms.entries.publish" },
      { roleId: "role-2", roleKey: "member", roleName: "Member", roleIsSystem: true, permissionKey: "cms.entries.manage" },
    ];
    findUserRoleRows.mockResolvedValue(rows);

    const { getUserContext } = await import("./service");
    const result = await getUserContext({ userId: "user-1" });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("expected success");
    expect(result.data.roles).toHaveLength(2);
    expect(result.data.permissions.sort()).toEqual(["cms.entries.manage", "cms.entries.publish"]);
    expect(result.data.isSuperadmin).toBe(false);
  });

  it("marks isSuperadmin true when the superadmin role is assigned", async () => {
    getCachedUserContext.mockReturnValue(null);
    const rows: UserRoleRow[] = [
      { roleId: "role-super", roleKey: "superadmin", roleName: "Super Admin", roleIsSystem: true, permissionKey: null },
    ];
    findUserRoleRows.mockResolvedValue(rows);

    const { getUserContext } = await import("./service");
    const result = await getUserContext({ userId: "user-1" });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("expected success");
    expect(result.data.isSuperadmin).toBe(true);
    expect(result.data.permissions).toEqual([]);
  });

  it("returns an empty context for a user with no roles", async () => {
    getCachedUserContext.mockReturnValue(null);
    findUserRoleRows.mockResolvedValue([]);

    const { getUserContext } = await import("./service");
    const result = await getUserContext({ userId: "user-1" });

    expect(result).toEqual({
      success: true,
      data: { userId: "user-1", roles: [], permissions: [], isSuperadmin: false },
    });
  });
});
