import { beforeEach, describe, expect, it, vi } from "vitest";

const assignScopeToRoleAssignment = vi.fn();

vi.mock("./service", () => ({
  assignScopeToRoleAssignment: (...args: unknown[]) => assignScopeToRoleAssignment(...args),
}));

const authorizeActor = vi.fn();

vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const validInput = { userId: "user-1", roleId: "role-1", scopeType: "cms.category", resourceId: "cat-a" };

describe("assignScopeToRoleAssignmentHandler", () => {
  beforeEach(() => {
    assignScopeToRoleAssignment.mockReset();
    authorizeActor.mockReset();
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
  });

  it("rejects blank fields without checking authorization", async () => {
    const { assignScopeToRoleAssignmentHandler } = await import("./handler");
    const result = await assignScopeToRoleAssignmentHandler({ ...validInput, resourceId: "  " });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.scopes.invalid_input", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
    expect(assignScopeToRoleAssignment).not.toHaveBeenCalled();
  });

  it("rejects an actor without rbac.roles.assign", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });

    const { assignScopeToRoleAssignmentHandler } = await import("./handler");
    const result = await assignScopeToRoleAssignmentHandler(validInput);

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });
    expect(authorizeActor).toHaveBeenCalledWith("rbac.roles.assign");
    expect(assignScopeToRoleAssignment).not.toHaveBeenCalled();
  });

  it("delegates to the service with the resolved actor when authorized", async () => {
    assignScopeToRoleAssignment.mockResolvedValue({ success: true, data: undefined });

    const { assignScopeToRoleAssignmentHandler } = await import("./handler");
    const result = await assignScopeToRoleAssignmentHandler(validInput);

    expect(assignScopeToRoleAssignment).toHaveBeenCalledWith({ ...validInput, actor: { id: "actor-1" } });
    expect(result).toEqual({ success: true, data: undefined });
  });
});
