import { beforeEach, describe, expect, it, vi } from "vitest";

const activateColorPalette = vi.fn();

vi.mock("./service", () => ({
  activateColorPalette: (...args: unknown[]) => activateColorPalette(...args),
}));

describe("activateColorPaletteHandler", () => {
  beforeEach(() => {
    activateColorPalette.mockReset();
  });

  it("rejects an empty paletteId without calling the service", async () => {
    const { activateColorPaletteHandler } = await import("./handler");
    const result = await activateColorPaletteHandler({ paletteId: "  " });

    expect(result).toEqual({
      success: false,
      error: { code: "themes.color_palette.invalid_id", message: expect.any(String) },
    });
    expect(activateColorPalette).not.toHaveBeenCalled();
  });

  it("delegates to the service for a non-empty paletteId", async () => {
    activateColorPalette.mockResolvedValue({ success: true, data: { paletteId: "oceano", activatedAt: new Date() } });

    const { activateColorPaletteHandler } = await import("./handler");
    await activateColorPaletteHandler({ paletteId: "oceano" });

    expect(activateColorPalette).toHaveBeenCalledWith({ paletteId: "oceano" });
  });
});
