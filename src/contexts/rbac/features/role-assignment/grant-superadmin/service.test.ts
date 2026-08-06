import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "user-1", type: "system" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
  recordAuditEvent: vi.fn(),
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

const ensureBaseRbacDataSeeded = vi.fn();

vi.mock("../../../ensure-base-rbac-data", () => ({
  ensureBaseRbacDataSeeded: (...args: unknown[]) => ensureBaseRbacDataSeeded(...args),
}));

describe("grantSuperadmin", () => {
  beforeEach(() => {
    insertUserRole.mockReset();
    findRoleIdByKey.mockReset();
    invalidateUserContext.mockReset();
    ensureBaseRbacDataSeeded.mockReset();
    ensureBaseRbacDataSeeded.mockResolvedValue(undefined);
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

  it("self-heals base RBAC data before looking up the role, so it still succeeds on a fresh DB", async () => {
    // Simula uma tabela roles vazia (fresh DB) que só passa a ter a linha "superadmin" depois
    // que ensureBaseRbacDataSeeded roda — prova que a ordem de chamada importa e que o fluxo se
    // recupera sozinho em vez de falhar com "rbac.roles.superadmin_role_missing".
    ensureBaseRbacDataSeeded.mockImplementation(async () => {
      findRoleIdByKey.mockResolvedValue("role-superadmin");
    });
    findRoleIdByKey.mockResolvedValue(null);
    insertUserRole.mockResolvedValue(undefined);

    const { grantSuperadmin } = await import("./service");
    const result = await grantSuperadmin({ userId: "user-1" });

    expect(ensureBaseRbacDataSeeded).toHaveBeenCalledTimes(1);
    expect(ensureBaseRbacDataSeeded.mock.invocationCallOrder[0]).toBeLessThan(findRoleIdByKey.mock.invocationCallOrder[0]);
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
