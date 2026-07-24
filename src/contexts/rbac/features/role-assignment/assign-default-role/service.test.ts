import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "user-1", type: "system" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const insertUserRole = vi.fn();

vi.mock("../assign-role-to-user/store", () => ({
  insertUserRole: (...args: unknown[]) => insertUserRole(...args),
}));

const findRoleIdByKey = vi.fn();

vi.mock("./store", () => ({
  findRoleIdByKey: (...args: unknown[]) => findRoleIdByKey(...args),
}));

const invalidateUserContext = vi.fn();

vi.mock("../../../user-context-cache", () => ({
  invalidateUserContext: (...args: unknown[]) => invalidateUserContext(...args),
}));

describe("grantDefaultRoleOnRegistration", () => {
  const originalEnv = process.env.RBAC_DEFAULT_REGISTRATION_ROLE_KEY;

  beforeEach(() => {
    insertUserRole.mockReset();
    findRoleIdByKey.mockReset();
    invalidateUserContext.mockReset();
  });

  afterEach(() => {
    process.env.RBAC_DEFAULT_REGISTRATION_ROLE_KEY = originalEnv;
  });

  it("resolves the default role key ('member' when unset) and grants it", async () => {
    delete process.env.RBAC_DEFAULT_REGISTRATION_ROLE_KEY;
    findRoleIdByKey.mockResolvedValue("role-member");
    insertUserRole.mockResolvedValue(undefined);

    const { grantDefaultRoleOnRegistration } = await import("./service");
    const result = await grantDefaultRoleOnRegistration({ userId: "user-1" });

    expect(findRoleIdByKey).toHaveBeenCalledWith("member");
    expect(insertUserRole).toHaveBeenCalledWith("user-1", "role-member");
    expect(invalidateUserContext).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("fails when the configured default role does not exist", async () => {
    process.env.RBAC_DEFAULT_REGISTRATION_ROLE_KEY = "missing-role";
    findRoleIdByKey.mockResolvedValue(null);

    const { grantDefaultRoleOnRegistration } = await import("./service");
    const result = await grantDefaultRoleOnRegistration({ userId: "user-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.not_found", message: expect.any(String) },
    });
    expect(insertUserRole).not.toHaveBeenCalled();
  });
});
