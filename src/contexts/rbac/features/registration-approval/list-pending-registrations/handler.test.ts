import { beforeEach, describe, expect, it, vi } from "vitest";

const listPendingRegistrations = vi.fn();

vi.mock("./service", () => ({
  listPendingRegistrations: (...args: unknown[]) => listPendingRegistrations(...args),
}));

const authorizeActor = vi.fn();

vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

describe("listPendingRegistrationsHandler", () => {
  beforeEach(() => {
    listPendingRegistrations.mockReset();
    authorizeActor.mockReset();
  });

  it("rejects an actor without rbac.registrations.approve", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });

    const { listPendingRegistrationsHandler } = await import("./handler");
    const result = await listPendingRegistrationsHandler();

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });
    expect(authorizeActor).toHaveBeenCalledWith("rbac.registrations.approve");
    expect(listPendingRegistrations).not.toHaveBeenCalled();
  });

  it("delegates to the service when authorized", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "admin-1" });
    listPendingRegistrations.mockResolvedValue({ success: true, data: [] });

    const { listPendingRegistrationsHandler } = await import("./handler");
    const result = await listPendingRegistrationsHandler();

    expect(result).toEqual({ success: true, data: [] });
  });
});
