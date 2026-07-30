import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();

vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const setExtensionEnabled = vi.fn();

vi.mock("./service", () => ({
  setExtensionEnabled: (...args: unknown[]) => setExtensionEnabled(...args),
}));

describe("setExtensionEnabledHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    setExtensionEnabled.mockReset();
  });

  it("rejects an empty key without checking authorization", async () => {
    const { setExtensionEnabledHandler } = await import("./handler");
    const result = await setExtensionEnabledHandler({ kind: "plugin", key: "  ", enabled: false });

    expect(result).toEqual({
      success: false,
      error: { code: "extensions.set.invalid_key", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("rejects an actor without platform.extensions.manage", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });

    const { setExtensionEnabledHandler } = await import("./handler");
    const result = await setExtensionEnabledHandler({ kind: "plugin", key: "birthdays", enabled: false });

    expect(authorizeActor).toHaveBeenCalledWith("platform.extensions.manage");
    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });
    expect(setExtensionEnabled).not.toHaveBeenCalled();
  });

  it("delegates to the service with the resolved actor when authorized", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    setExtensionEnabled.mockResolvedValue({ success: true, data: { kind: "plugin", key: "birthdays", enabled: false, updatedAt: new Date(), updatedByUserId: "actor-1" } });

    const { setExtensionEnabledHandler } = await import("./handler");
    const result = await setExtensionEnabledHandler({ kind: "plugin", key: "birthdays", enabled: false });

    expect(setExtensionEnabled).toHaveBeenCalledWith({ kind: "plugin", key: "birthdays", enabled: false, actorId: "actor-1" });
    expect(result.success).toBe(true);
  });
});
