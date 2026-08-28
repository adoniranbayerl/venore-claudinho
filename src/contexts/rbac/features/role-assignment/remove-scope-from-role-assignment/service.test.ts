import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const deleteRoleAssignmentScope = vi.fn();

vi.mock("./store", () => ({
  deleteRoleAssignmentScope: (...args: unknown[]) => deleteRoleAssignmentScope(...args),
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

describe("removeScopeFromRoleAssignment", () => {
  beforeEach(() => {
    deleteRoleAssignmentScope.mockReset();
    invalidateUserContext.mockReset();
  });

  it("deletes the scope row and invalidates the affected user's cached context", async () => {
    deleteRoleAssignmentScope.mockResolvedValue(undefined);

    const { removeScopeFromRoleAssignment } = await import("./service");
    const result = await removeScopeFromRoleAssignment(command);

    expect(result).toEqual({ success: true, data: undefined });
    expect(deleteRoleAssignmentScope).toHaveBeenCalledWith("user-1", "role-1", "cms.category", "cat-a");
    expect(invalidateUserContext).toHaveBeenCalledWith("user-1");
  });

  it("is idempotent — succeeds even when there is no matching scope row", async () => {
    deleteRoleAssignmentScope.mockResolvedValue(undefined);

    const { removeScopeFromRoleAssignment } = await import("./service");
    const result = await removeScopeFromRoleAssignment({ ...command, resourceId: "never-scoped" });

    expect(result).toEqual({ success: true, data: undefined });
    expect(invalidateUserContext).toHaveBeenCalledWith("user-1");
  });
});
