import { beforeEach, describe, expect, it, vi } from "vitest";

const getAdminPageData = vi.fn();
vi.mock("./get-admin-page-data", () => ({
  getAdminPageData: (...args: unknown[]) => getAdminPageData(...args),
}));

const isPluginActive = vi.fn();
vi.mock("../plugin-engine/is-plugin-active", () => ({
  isPluginActive: (...args: unknown[]) => isPluginActive(...args),
}));

describe("getAcademyPageData", () => {
  beforeEach(() => {
    getAdminPageData.mockReset();
    isPluginActive.mockReset();
    isPluginActive.mockResolvedValue(true);
  });

  it("propagates the gate as-is when the base admin gate denies access", async () => {
    getAdminPageData.mockResolvedValue({ granted: false, reason: "unauthenticated" });

    const { getAcademyPageData } = await import("./get-academy-page-data");
    const result = await getAcademyPageData();

    expect(result).toEqual({ granted: false, reason: "unauthenticated" });
    expect(isPluginActive).not.toHaveBeenCalled();
  });

  it("grants access to a superadmin when the plugin is active", async () => {
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: true, permissions: [] },
    });

    const { getAcademyPageData } = await import("./get-academy-page-data");
    const result = await getAcademyPageData();

    expect(result.granted).toBe(true);
  });

  it("denies access as forbidden when the academy plugin is disabled, even for a superadmin", async () => {
    isPluginActive.mockResolvedValue(false);
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: true, permissions: [] },
    });

    const { getAcademyPageData } = await import("./get-academy-page-data");
    const result = await getAcademyPageData();

    expect(result).toEqual({ granted: false, reason: "forbidden" });
    expect(isPluginActive).toHaveBeenCalledWith("academy");
  });

  it("denies access as forbidden when the actor passed the base admin gate but lacks academy.courses.manage", async () => {
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: false, permissions: ["platform.admin.access"] },
    });

    const { getAcademyPageData } = await import("./get-academy-page-data");
    const result = await getAcademyPageData();

    expect(result).toEqual({ granted: false, reason: "forbidden" });
  });
});
