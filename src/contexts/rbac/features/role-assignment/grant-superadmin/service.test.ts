import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "user-1", type: "system" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const insertUserRole = vi.fn();

vi.mock("../assign-role-to-user/store", () => ({
  insertUserRole: (...args: unknown[]) => insertUserRole(...args),
}));

const findRoleIdByKey = vi.fn();

vi.mock("../assign-default-role/store", () => ({
  findRoleIdByKey: (...args: unknown[]) => findRoleIdByKey(...args),
}));

const invalidateUserContext = vi.fn();

vi.mock("../../../user-context-cache", () => ({
  invalidateUserContext: (...args: unknown[]) => invalidateUserContext(...args),
}));

describe("grantSuperadmin", () => {
  beforeEach(() => {
    insertUserRole.mockReset();
    findRoleIdByKey.mockReset();
    invalidateUserContext.mockReset();
  });

  it("grants the superadmin role to the given user", async () => {
    findRoleIdByKey.mockResolvedValue("role-superadmin");
    insertUserRole.mockResolvedValue(undefined);

    const { grantSuperadmin } = await import("./service");
    const result = await grantSuperadmin({ userId: "user-1" });

    expect(findRoleIdByKey).toHaveBeenCalledWith("superadmin");
    expect(insertUserRole).toHaveBeenCalledWith("user-1", "role-superadmin");
    expect(invalidateUserContext).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("fails when the superadmin role does not exist", async () => {
    findRoleIdByKey.mockResolvedValue(null);

    const { grantSuperadmin } = await import("./service");
    const result = await grantSuperadmin({ userId: "user-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.superadmin_role_missing", message: expect.any(String) },
    });
    expect(insertUserRole).not.toHaveBeenCalled();
  });
});
