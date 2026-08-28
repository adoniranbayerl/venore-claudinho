import { beforeEach, describe, expect, it, vi } from "vitest";

const removeScopeFromRoleAssignment = vi.fn();

vi.mock("./service", () => ({
  removeScopeFromRoleAssignment: (...args: unknown[]) => removeScopeFromRoleAssignment(...args),
}));

const authorizeActor = vi.fn();

vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const validInput = { userId: "user-1", roleId: "role-1", scopeType: "cms.category", resourceId: "cat-a" };

describe("removeScopeFromRoleAssignmentHandler", () => {
  beforeEach(() => {
    removeScopeFromRoleAssignment.mockReset();
    authorizeActor.mockReset();
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
  });

  it("rejects blank fields without checking authorization", async () => {
    const { removeScopeFromRoleAssignmentHandler } = await import("./handler");
    const result = await removeScopeFromRoleAssignmentHandler({ ...validInput, roleId: "" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.scopes.invalid_input", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
    expect(removeScopeFromRoleAssignment).not.toHaveBeenCalled();
  });

  it("rejects an actor without rbac.roles.assign", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });

    const { removeScopeFromRoleAssignmentHandler } = await import("./handler");
    const result = await removeScopeFromRoleAssignmentHandler(validInput);

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });
    expect(removeScopeFromRoleAssignment).not.toHaveBeenCalled();
  });

  it("delegates to the service with the resolved actor when authorized", async () => {
    removeScopeFromRoleAssignment.mockResolvedValue({ success: true, data: undefined });

    const { removeScopeFromRoleAssignmentHandler } = await import("./handler");
    const result = await removeScopeFromRoleAssignmentHandler(validInput);

    expect(removeScopeFromRoleAssignment).toHaveBeenCalledWith({ ...validInput, actor: { id: "actor-1" } });
    expect(result).toEqual({ success: true, data: undefined });
  });
});
