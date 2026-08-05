import { beforeEach, describe, expect, it, vi } from "vitest";

const getAdminPageData = vi.fn();
vi.mock("./get-admin-page-data", () => ({
  getAdminPageData: (...args: unknown[]) => getAdminPageData(...args),
}));

const isPluginActive = vi.fn();
vi.mock("../plugin-engine/is-plugin-active", () => ({
  isPluginActive: (...args: unknown[]) => isPluginActive(...args),
}));

describe("getBirthdaysPageData", () => {
  beforeEach(() => {
    getAdminPageData.mockReset();
    isPluginActive.mockReset();
    isPluginActive.mockResolvedValue(true);
  });

  it("propagates the gate as-is when the base admin gate denies access", async () => {
    getAdminPageData.mockResolvedValue({ granted: false, reason: "unauthenticated" });

    const { getBirthdaysPageData } = await import("./get-birthdays-page-data");
    const result = await getBirthdaysPageData();

    expect(result).toEqual({ granted: false, reason: "unauthenticated" });
    expect(isPluginActive).not.toHaveBeenCalled();
  });

  it("grants access when the actor has birthdays.read and the plugin is active", async () => {
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: false, permissions: ["birthdays.read"] },
    });

    const { getBirthdaysPageData } = await import("./get-birthdays-page-data");
    const result = await getBirthdaysPageData();

    expect(result.granted).toBe(true);
  });

  it("denies access as forbidden when the birthdays plugin is disabled, even for a superadmin", async () => {
    isPluginActive.mockResolvedValue(false);
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: true, permissions: [] },
    });

    const { getBirthdaysPageData } = await import("./get-birthdays-page-data");
    const result = await getBirthdaysPageData();

    expect(result).toEqual({ granted: false, reason: "forbidden" });
    expect(isPluginActive).toHaveBeenCalledWith("birthdays");
  });

  it("denies access as forbidden when the actor passed the base admin gate but lacks birthdays.read", async () => {
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: false, permissions: ["platform.admin.access"] },
    });

    const { getBirthdaysPageData } = await import("./get-birthdays-page-data");
    const result = await getBirthdaysPageData();

    expect(result).toEqual({ granted: false, reason: "forbidden" });
  });
});
