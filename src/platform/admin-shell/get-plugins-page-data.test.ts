import { beforeEach, describe, expect, it, vi } from "vitest";

const getAdminPageData = vi.fn();

vi.mock("./get-admin-page-data", () => ({
  getAdminPageData: (...args: unknown[]) => getAdminPageData(...args),
}));

describe("getPluginsPageData", () => {
  beforeEach(() => {
    getAdminPageData.mockReset();
  });

  it("propagates the gate as-is when the base admin gate denies access", async () => {
    getAdminPageData.mockResolvedValue({ granted: false, reason: "unauthenticated" });

    const { getPluginsPageData } = await import("./get-plugins-page-data");
    const result = await getPluginsPageData();

    expect(result).toEqual({ granted: false, reason: "unauthenticated" });
  });

  it("grants access to a superadmin even without the dedicated permission", async () => {
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: true, permissions: [] },
    });

    const { getPluginsPageData } = await import("./get-plugins-page-data");
    const result = await getPluginsPageData();

    expect(result.granted).toBe(true);
  });

  it("grants access when the actor has platform.extensions.manage", async () => {
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: false, permissions: ["platform.extensions.manage"] },
    });

    const { getPluginsPageData } = await import("./get-plugins-page-data");
    const result = await getPluginsPageData();

    expect(result.granted).toBe(true);
  });

  it("denies a section admin who passed the base gate but only holds platform.admin.access + a section's manage keys", async () => {
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: {
        id: "user-1",
        name: null,
        email: null,
        isSuperadmin: false,
        permissions: ["platform.admin.access", "cms.entries.manage", "cms.categories.manage"],
      },
    });

    const { getPluginsPageData } = await import("./get-plugins-page-data");
    const result = await getPluginsPageData();

    expect(result).toEqual({ granted: false, reason: "forbidden" });
  });
});
