import { beforeEach, describe, expect, it, vi } from "vitest";

const getActiveTheme = vi.fn();

vi.mock("@/contexts/themes", () => ({
  getActiveTheme: (...args: unknown[]) => getActiveTheme(...args),
}));

const listExtensionStates = vi.fn();
const setExtensionEnabled = vi.fn();

vi.mock("@/contexts/extensions", () => ({
  listExtensionStates: (...args: unknown[]) => listExtensionStates(...args),
  setExtensionEnabled: (...args: unknown[]) => setExtensionEnabled(...args),
}));

vi.mock("@/themes/registry", () => ({
  THEME_REGISTRY: { "venore-slime": {}, "venore-basic": {} },
}));

describe("toggleThemeEnabled", () => {
  beforeEach(() => {
    getActiveTheme.mockReset();
    listExtensionStates.mockReset();
    setExtensionEnabled.mockReset();
  });

  it("enables a theme without checking invariants", async () => {
    setExtensionEnabled.mockResolvedValue({ success: true, data: {} });

    const { toggleThemeEnabled } = await import("./toggle-theme-enabled");
    const result = await toggleThemeEnabled({ themeKey: "venore-basic", enabled: true });

    expect(getActiveTheme).not.toHaveBeenCalled();
    expect(setExtensionEnabled).toHaveBeenCalledWith({ kind: "theme", key: "venore-basic", enabled: true });
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("refuses to disable the active theme", async () => {
    getActiveTheme.mockResolvedValue({ success: true, data: { themeKey: "venore-basic", activatedAt: new Date() } });
    listExtensionStates.mockResolvedValue({ success: true, data: {} });

    const { toggleThemeEnabled } = await import("./toggle-theme-enabled");
    const result = await toggleThemeEnabled({ themeKey: "venore-basic", enabled: false });

    expect(result).toEqual({
      success: false,
      error: { code: "theme-engine.disable.active_theme", message: expect.any(String) },
    });
    expect(setExtensionEnabled).not.toHaveBeenCalled();
  });

  it("refuses to disable the last enabled theme even when it is not the active one", async () => {
    getActiveTheme.mockResolvedValue({ success: true, data: { themeKey: "some-other-active-theme", activatedAt: null } });
    listExtensionStates.mockResolvedValue({ success: true, data: { "venore-basic": false } });

    const { toggleThemeEnabled } = await import("./toggle-theme-enabled");
    const result = await toggleThemeEnabled({ themeKey: "venore-slime", enabled: false });

    expect(result).toEqual({
      success: false,
      error: { code: "theme-engine.disable.last_enabled_theme", message: expect.any(String) },
    });
    expect(setExtensionEnabled).not.toHaveBeenCalled();
  });

  it("allows disabling a non-active theme when another one remains enabled", async () => {
    getActiveTheme.mockResolvedValue({ success: true, data: { themeKey: "venore-slime", activatedAt: null } });
    listExtensionStates.mockResolvedValue({ success: true, data: {} });
    setExtensionEnabled.mockResolvedValue({ success: true, data: {} });

    const { toggleThemeEnabled } = await import("./toggle-theme-enabled");
    const result = await toggleThemeEnabled({ themeKey: "venore-basic", enabled: false });

    expect(setExtensionEnabled).toHaveBeenCalledWith({ kind: "theme", key: "venore-basic", enabled: false });
    expect(result).toEqual({ success: true, data: undefined });
  });
});
