import { beforeEach, describe, expect, it, vi } from "vitest";

const getActiveTheme = vi.fn();

vi.mock("@/contexts/themes", () => ({
  getActiveTheme: (...args: unknown[]) => getActiveTheme(...args),
}));

const listExtensionStates = vi.fn();

vi.mock("@/contexts/extensions", () => ({
  listExtensionStates: (...args: unknown[]) => listExtensionStates(...args),
}));

vi.mock("@/themes/registry", () => ({
  THEME_REGISTRY: {
    "venore-slime": { manifest: { key: "venore-slime", name: "Venore Slime" } },
    "venore-basic": { manifest: { key: "venore-basic", name: "Venore Basic" } },
  },
}));

describe("listThemeStates", () => {
  beforeEach(() => {
    getActiveTheme.mockReset();
    listExtensionStates.mockReset();
  });

  it("marks the active theme as blocked from being disabled, with the reason visible", async () => {
    getActiveTheme.mockResolvedValue({ success: true, data: { themeKey: "venore-slime", activatedAt: null } });
    listExtensionStates.mockResolvedValue({ success: true, data: {} });

    const { listThemeStates } = await import("./list-theme-states");
    const states = await listThemeStates();

    const active = states.find((state) => state.manifest.key === "venore-slime");
    expect(active).toMatchObject({ isActive: true, canDisable: false });
    expect(active?.disableBlockedReason).toEqual(expect.any(String));
  });

  it("marks the sole remaining enabled theme as blocked, with the reason visible, even when not active", async () => {
    getActiveTheme.mockResolvedValue({ success: true, data: { themeKey: "some-other-active-theme", activatedAt: null } });
    listExtensionStates.mockResolvedValue({ success: true, data: { "venore-basic": { installed: true, enabled: false } } });

    const { listThemeStates } = await import("./list-theme-states");
    const states = await listThemeStates();

    const slime = states.find((state) => state.manifest.key === "venore-slime");
    expect(slime).toMatchObject({ isActive: false, enabled: true, canDisable: false });
    expect(slime?.disableBlockedReason).toEqual(expect.any(String));

    const basic = states.find((state) => state.manifest.key === "venore-basic");
    expect(basic).toMatchObject({ enabled: false });
  });

  it("allows disabling a non-active theme when another remains enabled", async () => {
    getActiveTheme.mockResolvedValue({ success: true, data: { themeKey: "venore-slime", activatedAt: null } });
    listExtensionStates.mockResolvedValue({ success: true, data: {} });

    const { listThemeStates } = await import("./list-theme-states");
    const states = await listThemeStates();

    const basic = states.find((state) => state.manifest.key === "venore-basic");
    expect(basic).toMatchObject({ canDisable: true, disableBlockedReason: null });
  });
});
