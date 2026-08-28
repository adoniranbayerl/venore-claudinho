import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const userRoleAssignmentExists = vi.fn();
const insertRoleAssignmentScope = vi.fn();

vi.mock("./store", () => ({
  userRoleAssignmentExists: (...args: unknown[]) => userRoleAssignmentExists(...args),
  insertRoleAssignmentScope: (...args: unknown[]) => insertRoleAssignmentScope(...args),
}));

const invalidateUserContext = vi.fn();

vi.mock("../../../user-context-cache", () => ({
  invalidateUserContext: (...args: unknown[]) => invalidateUserContext(...args),
}));

const command = {
  userId: "user-1",
  roleId: "role-1",
  scopeType: "cms.category",
  resourceId: "cat-a",
  actor: { id: "actor-1" },
};

describe("assignScopeToRoleAssignment", () => {
  beforeEach(() => {
    userRoleAssignmentExists.mockReset();
    insertRoleAssignmentScope.mockReset();
    invalidateUserContext.mockReset();
  });

  it("rejects an unknown scope type before touching the store", async () => {
    const { assignScopeToRoleAssignment } = await import("./service");
    const result = await assignScopeToRoleAssignment({ ...command, scopeType: "bogus.type" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.scopes.invalid_type", message: expect.any(String) },
    });
    expect(userRoleAssignmentExists).not.toHaveBeenCalled();
    expect(insertRoleAssignmentScope).not.toHaveBeenCalled();
  });

  it("fails when the user does not hold the role", async () => {
    userRoleAssignmentExists.mockResolvedValue(false);

    const { assignScopeToRoleAssignment } = await import("./service");
    const result = await assignScopeToRoleAssignment(command);

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.scopes.assignment_not_found", message: expect.any(String) },
    });
    expect(insertRoleAssignmentScope).not.toHaveBeenCalled();
    expect(invalidateUserContext).not.toHaveBeenCalled();
  });

  it("inserts the scope idempotently and invalidates the affected user's cached context", async () => {
    userRoleAssignmentExists.mockResolvedValue(true);
    insertRoleAssignmentScope.mockResolvedValue(undefined);

    const { assignScopeToRoleAssignment } = await import("./service");
    const result = await assignScopeToRoleAssignment(command);

    expect(result).toEqual({ success: true, data: undefined });
    expect(insertRoleAssignmentScope).toHaveBeenCalledWith("user-1", "role-1", "cms.category", "cat-a");
    expect(invalidateUserContext).toHaveBeenCalledWith("user-1");
  });
});
