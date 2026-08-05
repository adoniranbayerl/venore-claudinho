import { beforeEach, describe, expect, it, vi } from "vitest";

const setSetting = vi.fn();

vi.mock("@/contexts/settings", () => ({
  setSetting: (...args: unknown[]) => setSetting(...args),
}));

describe("activateColorPalette", () => {
  beforeEach(() => {
    setSetting.mockReset();
  });

  it("persists the palette id via contexts/settings", async () => {
    setSetting.mockResolvedValue({
      success: true,
      data: { key: "theme.activePaletteId", value: "oceano", updatedAt: new Date("2026-01-01") },
    });

    const { activateColorPalette } = await import("./service");
    const result = await activateColorPalette({ paletteId: "oceano" });

    expect(setSetting).toHaveBeenCalledWith({ key: "theme.activePaletteId", value: "oceano" });
    expect(result).toEqual({ success: true, data: { paletteId: "oceano", activatedAt: new Date("2026-01-01") } });
  });

  it("propagates the error from contexts/settings (e.g. unauthorized)", async () => {
    setSetting.mockResolvedValue({ success: false, error: { code: "rbac.authorization.forbidden", message: "nope" } });

    const { activateColorPalette } = await import("./service");
    const result = await activateColorPalette({ paletteId: "oceano" });

    expect(result).toEqual({ success: false, error: { code: "rbac.authorization.forbidden", message: "nope" } });
  });
});
