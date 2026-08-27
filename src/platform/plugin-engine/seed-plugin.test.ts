import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({ authorizeActor: (...args: unknown[]) => authorizeActor(...args) }));

const listExtensionStates = vi.fn();
vi.mock("@/contexts/extensions", () => ({ listExtensionStates: (...args: unknown[]) => listExtensionStates(...args) }));

const recordAuditEvent = vi.fn();
vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
  recordAuditEvent: (...args: unknown[]) => recordAuditEvent(...args),
}));

const resolvePluginSeed = vi.fn();
vi.mock("./plugin-seed-registry", () => ({ resolvePluginSeed: (...args: unknown[]) => resolvePluginSeed(...args) }));

vi.mock("@/plugins/registry", () => ({
  PLUGIN_REGISTRY: [{ key: "birthdays", name: "Birthdays", version: "1.0.0" }],
}));

describe("seedPlugin", () => {
  const seedFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "user-1" });
    listExtensionStates.mockResolvedValue({ success: true, data: { birthdays: { installed: true, enabled: true } } });
    resolvePluginSeed.mockReturnValue(seedFn);
    seedFn.mockResolvedValue({ success: true, data: undefined });
  });

  it("rejects when the actor lacks platform.extensions.manage", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "no" },
    });

    const { seedPlugin } = await import("./seed-plugin");
    const result = await seedPlugin({ pluginKey: "birthdays", seedKey: "example" });

    expect(result).toEqual({ success: false, error: { code: "rbac.authorization.forbidden", message: "no" } });
    expect(seedFn).not.toHaveBeenCalled();
    expect(recordAuditEvent).not.toHaveBeenCalled();
  });

  it("rejects a plugin key that is not in the registry", async () => {
    const { seedPlugin } = await import("./seed-plugin");
    const result = await seedPlugin({ pluginKey: "ghost", seedKey: "example" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("plugin-engine.seed.unknown_plugin");
    expect(seedFn).not.toHaveBeenCalled();
  });

  it("rejects when the plugin is not installed", async () => {
    listExtensionStates.mockResolvedValue({ success: true, data: {} });

    const { seedPlugin } = await import("./seed-plugin");
    const result = await seedPlugin({ pluginKey: "birthdays", seedKey: "example" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("plugin-engine.seed.not_installed");
    expect(seedFn).not.toHaveBeenCalled();
  });

  it("rejects an unknown seed key", async () => {
    resolvePluginSeed.mockReturnValue(null);

    const { seedPlugin } = await import("./seed-plugin");
    const result = await seedPlugin({ pluginKey: "birthdays", seedKey: "nope" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("plugin-engine.seed.unknown_seed");
    expect(seedFn).not.toHaveBeenCalled();
  });

  it("runs the seed and audits success on the happy path", async () => {
    const { seedPlugin } = await import("./seed-plugin");
    const result = await seedPlugin({ pluginKey: "birthdays", seedKey: "example" });

    expect(result).toEqual({ success: true, data: undefined });
    expect(seedFn).toHaveBeenCalledTimes(1);
    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "plugin-engine.seed-plugin",
        outcome: "success",
        detail: { pluginKey: "birthdays", seedKey: "example" },
      }),
    );
  });

  it("propagates and audits a seed failure", async () => {
    seedFn.mockResolvedValue({ success: false, error: { code: "boom", message: "kaboom" } });

    const { seedPlugin } = await import("./seed-plugin");
    const result = await seedPlugin({ pluginKey: "birthdays", seedKey: "example" });

    expect(result).toEqual({ success: false, error: { code: "boom", message: "kaboom" } });
    expect(recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({ outcome: "failure" }));
  });
});
