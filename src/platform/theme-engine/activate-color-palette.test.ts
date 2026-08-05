import { beforeEach, describe, expect, it, vi } from "vitest";

const activateColorPaletteContext = vi.fn();

vi.mock("@/contexts/themes", () => ({
  activateColorPalette: (...args: unknown[]) => activateColorPaletteContext(...args),
}));

const resolveActiveTheme = vi.fn();

vi.mock("@/platform/theme-rendering/resolve-active-theme", () => ({
  resolveActiveTheme: (...args: unknown[]) => resolveActiveTheme(...args),
}));

describe("activateColorPalette (platform wrapper)", () => {
  beforeEach(() => {
    activateColorPaletteContext.mockReset();
    resolveActiveTheme.mockReset();
  });

  it("always allows activating 'default' without checking the catalog", async () => {
    activateColorPaletteContext.mockResolvedValue({ success: true, data: { paletteId: "default", activatedAt: null } });

    const { activateColorPalette } = await import("./activate-color-palette");
    const result = await activateColorPalette({ paletteId: "default" });

    expect(resolveActiveTheme).not.toHaveBeenCalled();
    expect(activateColorPaletteContext).toHaveBeenCalledWith({ paletteId: "default" });
    expect(result).toEqual({ success: true, data: { paletteId: "default", activatedAt: null } });
  });

  it("rejects a paletteId absent from the active theme's catalog", async () => {
    resolveActiveTheme.mockResolvedValue({ colorPalettes: [{ id: "oceano", name: "Oceano", light: {}, dark: {} }] });

    const { activateColorPalette } = await import("./activate-color-palette");
    const result = await activateColorPalette({ paletteId: "inexistente" });

    expect(result).toEqual({
      success: false,
      error: { code: "theme-engine.color_palette.not_found", message: expect.any(String) },
    });
    expect(activateColorPaletteContext).not.toHaveBeenCalled();
  });

  it("delegates to contexts/themes when the paletteId exists in the active theme's catalog", async () => {
    resolveActiveTheme.mockResolvedValue({ colorPalettes: [{ id: "oceano", name: "Oceano", light: {}, dark: {} }] });
    activateColorPaletteContext.mockResolvedValue({ success: true, data: { paletteId: "oceano", activatedAt: new Date() } });

    const { activateColorPalette } = await import("./activate-color-palette");
    await activateColorPalette({ paletteId: "oceano" });

    expect(activateColorPaletteContext).toHaveBeenCalledWith({ paletteId: "oceano" });
  });
});
