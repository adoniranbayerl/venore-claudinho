import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();

vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const setExtensionInstalled = vi.fn();

vi.mock("./service", () => ({
  setExtensionInstalled: (...args: unknown[]) => setExtensionInstalled(...args),
}));

describe("setExtensionInstalledHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    setExtensionInstalled.mockReset();
  });

  it("rejects an empty key without checking authorization", async () => {
    const { setExtensionInstalledHandler } = await import("./handler");
    const result = await setExtensionInstalledHandler({ kind: "plugin", key: "  " });

    expect(result).toEqual({
      success: false,
      error: { code: "extensions.install.invalid_key", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("rejects an actor without platform.extensions.manage", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });

    const { setExtensionInstalledHandler } = await import("./handler");
    const result = await setExtensionInstalledHandler({ kind: "plugin", key: "broadcast" });

    expect(authorizeActor).toHaveBeenCalledWith("platform.extensions.manage");
    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });
    expect(setExtensionInstalled).not.toHaveBeenCalled();
  });

  it("delegates to the service with the resolved actor when authorized", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    setExtensionInstalled.mockResolvedValue({ success: true, data: { kind: "plugin", key: "broadcast" } });

    const { setExtensionInstalledHandler } = await import("./handler");
    const result = await setExtensionInstalledHandler({ kind: "plugin", key: "broadcast" });

    expect(setExtensionInstalled).toHaveBeenCalledWith({ kind: "plugin", key: "broadcast", actorId: "actor-1" });
    expect(result.success).toBe(true);
  });
});
