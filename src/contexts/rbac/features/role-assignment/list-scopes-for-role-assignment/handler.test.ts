import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const listScopesForRoleAssignment = vi.fn();
vi.mock("./service", () => ({
  listScopesForRoleAssignment: (...args: unknown[]) => listScopesForRoleAssignment(...args),
}));

describe("listScopesForRoleAssignmentHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    listScopesForRoleAssignment.mockReset().mockResolvedValue({ success: true, data: [] });
  });

  it("rejects empty input before authorizing", async () => {
    const { listScopesForRoleAssignmentHandler } = await import("./handler");
    const result = await listScopesForRoleAssignmentHandler({ userId: "", roleId: "r-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.scopes.invalid_input", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("is gated by rbac.roles.assign", async () => {
    authorizeActor.mockResolvedValue({ authorized: false, error: { code: "rbac.authorization.forbidden", message: "x" } });

    const { listScopesForRoleAssignmentHandler } = await import("./handler");
    const result = await listScopesForRoleAssignmentHandler({ userId: "u-1", roleId: "r-1" });

    expect(authorizeActor).toHaveBeenCalledWith("rbac.roles.assign");
    expect(result.success).toBe(false);
    expect(listScopesForRoleAssignment).not.toHaveBeenCalled();
  });

  it("delegates to the service when authorized", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    listScopesForRoleAssignment.mockResolvedValue({
      success: true,
      data: [{ scopeType: "cms.category", resourceId: "cat-a" }],
    });

    const { listScopesForRoleAssignmentHandler } = await import("./handler");
    const result = await listScopesForRoleAssignmentHandler({ userId: "u-1", roleId: "r-1" });

    expect(listScopesForRoleAssignment).toHaveBeenCalledWith({ userId: "u-1", roleId: "r-1" });
    expect(result).toEqual({ success: true, data: [{ scopeType: "cms.category", resourceId: "cat-a" }] });
  });
});
