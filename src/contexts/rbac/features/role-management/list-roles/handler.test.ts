import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();

vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const listRoles = vi.fn();

vi.mock("./service", () => ({
  listRoles: (...args: unknown[]) => listRoles(...args),
}));

describe("listRolesHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    listRoles.mockReset();
  });

  it("rejects when the actor is not authorized", async () => {
    const error = { code: "rbac.authorization.forbidden", message: "sem permission" };
    authorizeActor.mockResolvedValue({ authorized: false, error });

    const { listRolesHandler } = await import("./handler");
    const result = await listRolesHandler();

    expect(result).toEqual({ success: false, error });
    expect(listRoles).not.toHaveBeenCalled();
  });

  it("delegates to the service when authorized", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "user-1" });
    listRoles.mockResolvedValue({ success: true, data: [] });

    const { listRolesHandler } = await import("./handler");
    const result = await listRolesHandler();

    expect(listRoles).toHaveBeenCalledWith();
    expect(result).toEqual({ success: true, data: [] });
  });
});
