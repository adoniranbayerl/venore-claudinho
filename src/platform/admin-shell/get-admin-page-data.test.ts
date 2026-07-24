import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const getUserContext = vi.fn();

vi.mock("@/contexts/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock("@/contexts/rbac", () => ({
  getUserContext: (...args: unknown[]) => getUserContext(...args),
}));

describe("getAdminPageData", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    getUserContext.mockReset();
  });

  it("denies access as unauthenticated when there is no session", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });

    const { getAdminPageData } = await import("./get-admin-page-data");
    const result = await getAdminPageData();

    expect(result).toEqual({ granted: false, reason: "unauthenticated" });
    expect(getUserContext).not.toHaveBeenCalled();
  });

  it("denies access as forbidden when getUserContext fails", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: false,
      error: { code: "rbac.roles.invalid_id", message: "userId não pode ser vazio." },
    });

    const { getAdminPageData } = await import("./get-admin-page-data");
    const result = await getAdminPageData();

    expect(result).toEqual({ granted: false, reason: "forbidden" });
  });

  it("grants access to a superadmin even without the dedicated permission", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: [], isSuperadmin: true },
    });

    const { getAdminPageData } = await import("./get-admin-page-data");
    const result = await getAdminPageData();

    expect(result.granted).toBe(true);
  });

  it("grants access when the actor has the dedicated platform.admin.access permission", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: ["platform.admin.access"], isSuperadmin: false },
    });

    const { getAdminPageData } = await import("./get-admin-page-data");
    const result = await getAdminPageData();

    expect(result.granted).toBe(true);
  });

  it("denies access as forbidden when the actor has other admin permissions but not the dedicated one", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: ["cms.entries.manage"], isSuperadmin: false },
    });

    const { getAdminPageData } = await import("./get-admin-page-data");
    const result = await getAdminPageData();

    expect(result).toEqual({ granted: false, reason: "forbidden" });
  });
});
