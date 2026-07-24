import { beforeEach, describe, expect, it, vi } from "vitest";

const getAdminPageData = vi.fn();

vi.mock("./get-admin-page-data", () => ({
  getAdminPageData: (...args: unknown[]) => getAdminPageData(...args),
}));

describe("getRbacPageData", () => {
  beforeEach(() => {
    getAdminPageData.mockReset();
  });

  it("propagates the gate as-is when the base admin gate denies access", async () => {
    getAdminPageData.mockResolvedValue({ granted: false, reason: "unauthenticated" });

    const { getRbacPageData } = await import("./get-rbac-page-data");
    const result = await getRbacPageData();

    expect(result).toEqual({ granted: false, reason: "unauthenticated" });
  });

  it("grants access to a superadmin even without the dedicated permission", async () => {
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: true, permissions: [] },
    });

    const { getRbacPageData } = await import("./get-rbac-page-data");
    const result = await getRbacPageData();

    expect(result.granted).toBe(true);
  });

  it("grants access when the actor has the rbac.roles.manage permission", async () => {
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: false, permissions: ["rbac.roles.manage"] },
    });

    const { getRbacPageData } = await import("./get-rbac-page-data");
    const result = await getRbacPageData();

    expect(result.granted).toBe(true);
  });

  it("denies access as forbidden when the actor passed the base admin gate but lacks rbac.roles.manage", async () => {
    getAdminPageData.mockResolvedValue({
      granted: true,
      actor: { id: "user-1", name: null, email: null, isSuperadmin: false, permissions: ["platform.admin.access"] },
    });

    const { getRbacPageData } = await import("./get-rbac-page-data");
    const result = await getRbacPageData();

    expect(result).toEqual({ granted: false, reason: "forbidden" });
  });
});
