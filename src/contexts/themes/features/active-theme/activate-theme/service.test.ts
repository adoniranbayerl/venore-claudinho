import { beforeEach, describe, expect, it, vi } from "vitest";

const setSetting = vi.fn();

vi.mock("@/contexts/settings", () => ({
  setSetting: (...args: unknown[]) => setSetting(...args),
}));

describe("activateTheme", () => {
  beforeEach(() => {
    setSetting.mockReset();
  });

  it("persists via contexts/settings when the contract version is compatible", async () => {
    setSetting.mockResolvedValue({ success: true, data: { key: "theme.active", value: "default", updatedAt: new Date("2026-01-01") } });

    const { activateTheme } = await import("./service");
    const result = await activateTheme({ themeKey: "default", themeContractVersion: "5.0.0" });

    expect(setSetting).toHaveBeenCalledWith({ key: "theme.active", value: "default" });
    expect(result).toEqual({ success: true, data: { themeKey: "default", activatedAt: new Date("2026-01-01") } });
  });

  it("rejects activation when themeContractVersion is incompatible, without calling settings", async () => {
    const { activateTheme } = await import("./service");
    const result = await activateTheme({ themeKey: "third-party", themeContractVersion: "1.0.0" });

    expect(result).toEqual({
      success: false,
      error: { code: "themes.activation.incompatible_contract_version", message: expect.any(String) },
    });
    expect(setSetting).not.toHaveBeenCalled();
  });

  it("propagates the error from contexts/settings (e.g. unauthorized)", async () => {
    setSetting.mockResolvedValue({ success: false, error: { code: "rbac.authorization.forbidden", message: "nope" } });

    const { activateTheme } = await import("./service");
    const result = await activateTheme({ themeKey: "default", themeContractVersion: "5.0.0" });

    expect(result).toEqual({ success: false, error: { code: "rbac.authorization.forbidden", message: "nope" } });
  });
});
