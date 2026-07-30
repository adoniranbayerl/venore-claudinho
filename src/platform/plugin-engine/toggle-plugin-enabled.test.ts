import { beforeEach, describe, expect, it, vi } from "vitest";

const setExtensionEnabled = vi.fn();

vi.mock("@/contexts/extensions", () => ({
  setExtensionEnabled: (...args: unknown[]) => setExtensionEnabled(...args),
}));

const invalidateCache = vi.fn();

vi.mock("@/infrastructure/cache/memory-cache", () => ({
  invalidateCache: (...args: unknown[]) => invalidateCache(...args),
}));

const registerPlugins = vi.fn();

vi.mock("./register-plugins", () => ({
  registerPlugins: (...args: unknown[]) => registerPlugins(...args),
  PLUGIN_ENGINE_REPORT_CACHE_KEY: "plugin-engine:report",
}));

describe("togglePluginEnabled", () => {
  beforeEach(() => {
    setExtensionEnabled.mockReset();
    invalidateCache.mockReset();
    registerPlugins.mockReset();
  });

  it("enables a plugin without checking dependents", async () => {
    setExtensionEnabled.mockResolvedValue({ success: true, data: {} });

    const { togglePluginEnabled } = await import("./toggle-plugin-enabled");
    const result = await togglePluginEnabled({ pluginKey: "birthdays", enabled: true });

    expect(registerPlugins).not.toHaveBeenCalled();
    expect(setExtensionEnabled).toHaveBeenCalledWith({ kind: "plugin", key: "birthdays", enabled: true });
    expect(invalidateCache).toHaveBeenCalledWith("plugin-engine:report");
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("blocks disabling a plugin that another enabled plugin requires, naming the dependent", async () => {
    registerPlugins.mockResolvedValue({
      entries: [
        { key: "birthdays", status: "active", manifest: { key: "birthdays", name: "Aniversariantes" }, errors: [] },
        {
          key: "party",
          status: "active",
          manifest: { key: "party", name: "Festa", dependencies: [{ pluginKey: "birthdays", type: "required" }] },
          errors: [],
        },
      ],
      permissions: [],
      navigation: [],
      routes: [],
      contentTypes: [],
      blocks: [],
    });

    const { togglePluginEnabled } = await import("./toggle-plugin-enabled");
    const result = await togglePluginEnabled({ pluginKey: "birthdays", enabled: false });

    expect(result).toEqual({
      success: false,
      error: { code: "plugin-engine.disable.blocked_by_dependents", message: expect.stringContaining("Festa") },
    });
    expect(setExtensionEnabled).not.toHaveBeenCalled();
    expect(invalidateCache).not.toHaveBeenCalled();
  });

  it("allows disabling a plugin once no active plugin depends on it, and invalidates the report cache", async () => {
    registerPlugins.mockResolvedValue({
      entries: [{ key: "birthdays", status: "active", manifest: { key: "birthdays", name: "Aniversariantes" }, errors: [] }],
      permissions: [],
      navigation: [],
      routes: [],
      contentTypes: [],
      blocks: [],
    });
    setExtensionEnabled.mockResolvedValue({ success: true, data: {} });

    const { togglePluginEnabled } = await import("./toggle-plugin-enabled");
    const result = await togglePluginEnabled({ pluginKey: "birthdays", enabled: false });

    expect(setExtensionEnabled).toHaveBeenCalledWith({ kind: "plugin", key: "birthdays", enabled: false });
    expect(invalidateCache).toHaveBeenCalledWith("plugin-engine:report");
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("propagates an error from contexts/extensions without invalidating the cache", async () => {
    registerPlugins.mockResolvedValue({ entries: [], permissions: [], navigation: [], routes: [], contentTypes: [], blocks: [] });
    setExtensionEnabled.mockResolvedValue({ success: false, error: { code: "rbac.authorization.forbidden", message: "nope" } });

    const { togglePluginEnabled } = await import("./toggle-plugin-enabled");
    const result = await togglePluginEnabled({ pluginKey: "birthdays", enabled: false });

    expect(result).toEqual({ success: false, error: { code: "rbac.authorization.forbidden", message: "nope" } });
    expect(invalidateCache).not.toHaveBeenCalled();
  });
});
