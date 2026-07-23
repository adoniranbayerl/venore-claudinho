import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const roleExists = vi.fn();
const insertUserRole = vi.fn();

vi.mock("./store", () => ({
  roleExists: (...args: unknown[]) => roleExists(...args),
  insertUserRole: (...args: unknown[]) => insertUserRole(...args),
}));

const invalidateUserContext = vi.fn();

vi.mock("../../../user-context-cache", () => ({
  invalidateUserContext: (...args: unknown[]) => invalidateUserContext(...args),
}));

describe("assignRoleToUser", () => {
  beforeEach(() => {
    roleExists.mockReset();
    insertUserRole.mockReset();
    invalidateUserContext.mockReset();
  });

  it("fails when the role does not exist", async () => {
    roleExists.mockResolvedValue(false);

    const { assignRoleToUser } = await import("./service");
    const result = await assignRoleToUser({ userId: "user-1", roleId: "missing", actor: { id: "actor-1" } });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.not_found", message: expect.any(String) },
    });
    expect(insertUserRole).not.toHaveBeenCalled();
    expect(invalidateUserContext).not.toHaveBeenCalled();
  });

  it("assigns the role when it exists, idempotently, and invalidates the actor's cached context", async () => {
    roleExists.mockResolvedValue(true);
    insertUserRole.mockResolvedValue(undefined);

    const { assignRoleToUser } = await import("./service");
    const result = await assignRoleToUser({ userId: "user-1", roleId: "role-1", actor: { id: "actor-1" } });

    expect(result).toEqual({ success: true, data: undefined });
    expect(insertUserRole).toHaveBeenCalledWith("user-1", "role-1");
    expect(invalidateUserContext).toHaveBeenCalledWith("user-1");
  });
});
