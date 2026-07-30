import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: (...args: unknown[]) => get(...args) }),
}));

describe("getSidebarCollapsed", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("defaults to expanded (false) when the cookie is absent", async () => {
    get.mockReturnValue(undefined);

    const { getSidebarCollapsed } = await import("./get-sidebar-collapsed");
    expect(await getSidebarCollapsed()).toBe(false);
  });

  it("returns true only when the cookie value is exactly 'true'", async () => {
    get.mockReturnValue({ value: "true" });

    const { getSidebarCollapsed } = await import("./get-sidebar-collapsed");
    expect(await getSidebarCollapsed()).toBe(true);
  });

  it("treats any other cookie value as expanded, not as a crash", async () => {
    get.mockReturnValue({ value: "yes" });

    const { getSidebarCollapsed } = await import("./get-sidebar-collapsed");
    expect(await getSidebarCollapsed()).toBe(false);
  });
});
