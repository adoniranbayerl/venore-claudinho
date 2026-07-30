import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
const set = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: (...args: unknown[]) => get(...args), set: (...args: unknown[]) => set(...args) }),
}));

describe("toggleSidebarCollapsedAction", () => {
  beforeEach(() => {
    get.mockReset();
    set.mockReset();
  });

  it("flips from expanded (no cookie yet) to collapsed", async () => {
    get.mockReturnValue(undefined);

    const { toggleSidebarCollapsedAction } = await import("./toggle-sidebar-collapsed-action");
    await toggleSidebarCollapsedAction();

    expect(set).toHaveBeenCalledWith(
      "sidebar-collapsed",
      "true",
      expect.objectContaining({ sameSite: "lax", path: "/" }),
    );
  });

  it("flips from collapsed back to expanded", async () => {
    get.mockReturnValue({ value: "true" });

    const { toggleSidebarCollapsedAction } = await import("./toggle-sidebar-collapsed-action");
    await toggleSidebarCollapsedAction();

    expect(set).toHaveBeenCalledWith(
      "sidebar-collapsed",
      "false",
      expect.objectContaining({ sameSite: "lax", path: "/" }),
    );
  });
});
