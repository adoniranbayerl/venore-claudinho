import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();

vi.mock("@/contexts/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

function sidebarNavInput(overrides: Partial<{ canAccessAdmin: boolean; onSignOut: () => Promise<void> }> = {}) {
  return {
    navMode: "main" as const,
    adminNavItems: [],
    canToggleAdminNav: false,
    onToggleNavMode: vi.fn(),
    canAccessAdmin: false,
    onSignOut: vi.fn(),
    ...overrides,
  };
}

describe("resolveThemeSlotProps", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
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
});
