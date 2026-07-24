import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();

vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const listUsersByRole = vi.fn();

vi.mock("./service", () => ({
  listUsersByRole: (...args: unknown[]) => listUsersByRole(...args),
}));

describe("listUsersByRoleHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    listUsersByRole.mockReset();
  });

  it("rejects an empty roleId without calling the service", async () => {
    const { listUsersByRoleHandler } = await import("./handler");
    const result = await listUsersByRoleHandler({ roleId: "" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_id", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("rejects when the actor is not authorized", async () => {
    const error = { code: "rbac.authorization.forbidden", message: "sem permission" };
    authorizeActor.mockResolvedValue({ authorized: false, error });

    const { listUsersByRoleHandler } = await import("./handler");
    const result = await listUsersByRoleHandler({ roleId: "role-1" });

    expect(result).toEqual({ success: false, error });
    expect(listUsersByRole).not.toHaveBeenCalled();
  });

  it("delegates to the service when authorized", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "user-1" });
    listUsersByRole.mockResolvedValue({ success: true, data: [] });

    const { listUsersByRoleHandler } = await import("./handler");
    const result = await listUsersByRoleHandler({ roleId: "role-1" });

    expect(listUsersByRole).toHaveBeenCalledWith({ roleId: "role-1" });
    expect(result).toEqual({ success: true, data: [] });
  });
});
