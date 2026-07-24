import { beforeEach, describe, expect, it, vi } from "vitest";

const activateTheme = vi.fn();

vi.mock("./service", () => ({
  activateTheme: (...args: unknown[]) => activateTheme(...args),
}));

describe("activateThemeHandler", () => {
  beforeEach(() => {
    activateTheme.mockReset();
  });

  it("rejects an empty themeKey without calling the service", async () => {
    const { activateThemeHandler } = await import("./handler");
    const result = await activateThemeHandler({ themeKey: "  ", themeContractVersion: "1.0.0" });

    expect(result).toEqual({
      success: false,
      error: { code: "themes.activation.invalid_key", message: expect.any(String) },
    });
    expect(activateTheme).not.toHaveBeenCalled();
  });

  it("delegates to the service for a non-empty themeKey", async () => {
    activateTheme.mockResolvedValue({ success: true, data: { themeKey: "default", activatedAt: new Date() } });

    const { activateThemeHandler } = await import("./handler");
    await activateThemeHandler({ themeKey: "default", themeContractVersion: "1.0.0" });

    expect(activateTheme).toHaveBeenCalledWith({ themeKey: "default", themeContractVersion: "1.0.0" });
  });
});
