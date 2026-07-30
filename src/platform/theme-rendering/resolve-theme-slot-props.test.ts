import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const getMenuByLocation = vi.fn();

vi.mock("@/contexts/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock("@/contexts/cms", () => ({
  getMenuByLocation: (...args: unknown[]) => getMenuByLocation(...args),
}));

function sidebarNavInput(
  overrides: Partial<{
    canAccessAdmin: boolean;
    onSignOut: () => Promise<void>;
    collapsed: boolean;
    onToggleCollapsed: () => Promise<void>;
  }> = {},
) {
  return {
    navMode: "main" as const,
    adminNavGroups: [],
    canToggleAdminNav: false,
    onToggleNavMode: vi.fn(),
    canAccessAdmin: false,
    onSignOut: vi.fn(),
    collapsed: false,
    onToggleCollapsed: vi.fn(),
    ...overrides,
  };
}

describe("resolveThemeSlotProps", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    getMenuByLocation.mockReset();
    getMenuByLocation.mockResolvedValue({ success: true, data: { location: "main-nav", items: [] } });
  });

  it("resolves header.user as null when there is no authenticated user", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });

    const { resolveThemeSlotProps } = await import("./resolve-theme-slot-props");
    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.header.user).toBeNull();
  });

  it("resolves header.user from the authenticated user, preferring name over email", async () => {
    getCurrentUser.mockResolvedValue({
      success: true,
      data: { id: "user-1", name: "Ada Lovelace", email: "ada@example.com", image: "https://img/ada.png" },
    });

    const { resolveThemeSlotProps } = await import("./resolve-theme-slot-props");
    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.header.user).toEqual({
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      imageUrl: "https://img/ada.png",
    });
  });

  it("falls back displayName to email, then to a generic label, when name is missing", async () => {
    getCurrentUser.mockResolvedValue({
      success: true,
      data: { id: "user-1", name: null, email: "ada@example.com", image: null },
    });

    const { resolveThemeSlotProps } = await import("./resolve-theme-slot-props");
    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.header.user?.displayName).toBe("ada@example.com");

    getCurrentUser.mockResolvedValue({
      success: true,
      data: { id: "user-1", name: null, email: null, image: null },
    });

    const props2 = await resolveThemeSlotProps(sidebarNavInput());
    expect(props2.header.user?.displayName).toBe("Usuário");
  });

  it("passes canAccessAdmin and onSignOut through to header props", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    const onSignOut = vi.fn();

    const { resolveThemeSlotProps } = await import("./resolve-theme-slot-props");
    const props = await resolveThemeSlotProps(sidebarNavInput({ canAccessAdmin: true, onSignOut }));

    expect(props.header.canAccessAdmin).toBe(true);
    expect(props.header.onSignOut).toBe(onSignOut);
  });

  it("resolves sidebarLeft.navItems from the main-nav menu when navMode is main", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    getMenuByLocation.mockResolvedValue({
      success: true,
      data: { location: "main-nav", items: [{ id: "item-1", menuId: "menu-1", label: "Home", href: "/", order: 0, createdAt: new Date() }] },
    });

    const { resolveThemeSlotProps } = await import("./resolve-theme-slot-props");
    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.sidebarLeft.navItems).toEqual([{ key: "item-1", label: "Home", href: "/" }]);
    expect(getMenuByLocation).toHaveBeenCalledWith({ location: "main-nav" });
  });

  it("falls back to the mock nav items when the main-nav menu lookup fails", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    getMenuByLocation.mockResolvedValue({ success: false, error: { code: "err", message: "boom" } });

    const { resolveThemeSlotProps } = await import("./resolve-theme-slot-props");
    const props = await resolveThemeSlotProps(sidebarNavInput());

    expect(props.sidebarLeft.navItems).toEqual([{ key: "home", label: "Home", href: "/", icon: "home" }]);
  });

  it("passes collapsed and onToggleCollapsed through to sidebarLeft props", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    const onToggleCollapsed = vi.fn();

    const { resolveThemeSlotProps } = await import("./resolve-theme-slot-props");
    const props = await resolveThemeSlotProps(sidebarNavInput({ collapsed: true, onToggleCollapsed }));

    expect(props.sidebarLeft.collapsed).toBe(true);
    expect(props.sidebarLeft.onToggleCollapsed).toBe(onToggleCollapsed);
  });

  it("uses adminNavGroups, not the main-nav menu, when navMode is admin", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    const adminNavGroups = [{ key: "rbac", label: "RBAC", items: [{ key: "admin.roles", label: "Papéis", href: "/admin/rbac" }] }];

    const { resolveThemeSlotProps } = await import("./resolve-theme-slot-props");
    const props = await resolveThemeSlotProps({ ...sidebarNavInput(), navMode: "admin", adminNavGroups });

    expect(props.sidebarLeft.navGroups).toBe(adminNavGroups);
    expect(props.sidebarLeft.navItems).toEqual([]);
  });
});
