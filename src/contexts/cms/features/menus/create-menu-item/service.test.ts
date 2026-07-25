import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findOrCreateMenuByLocation = vi.fn();
const findNextMenuItemOrder = vi.fn();
const insertMenuItem = vi.fn();

vi.mock("./store", () => ({
  findOrCreateMenuByLocation: (...args: unknown[]) => findOrCreateMenuByLocation(...args),
  findNextMenuItemOrder: (...args: unknown[]) => findNextMenuItemOrder(...args),
  insertMenuItem: (...args: unknown[]) => insertMenuItem(...args),
}));

describe("createMenuItem", () => {
  beforeEach(() => {
    findOrCreateMenuByLocation.mockReset();
    findNextMenuItemOrder.mockReset();
    insertMenuItem.mockReset();
  });

  it("creates the first item at order 0 for a fresh menu", async () => {
    findOrCreateMenuByLocation.mockResolvedValue({ id: "menu-1" });
    findNextMenuItemOrder.mockResolvedValue(0);
    insertMenuItem.mockResolvedValue({
      id: "item-1",
      menuId: "menu-1",
      label: "Home",
      href: "/",
      order: 0,
      createdAt: new Date(),
    });

    const { createMenuItem } = await import("./service");
    const result = await createMenuItem({
      location: "main-nav",
      label: "Home",
      href: "/",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(findOrCreateMenuByLocation).toHaveBeenCalledWith("main-nav");
    expect(insertMenuItem).toHaveBeenCalledWith({ menuId: "menu-1", label: "Home", href: "/", order: 0 });
  });

  it("appends new items after the current highest order", async () => {
    findOrCreateMenuByLocation.mockResolvedValue({ id: "menu-1" });
    findNextMenuItemOrder.mockResolvedValue(3);
    insertMenuItem.mockResolvedValue({
      id: "item-2",
      menuId: "menu-1",
      label: "Sobre",
      href: "/sobre",
      order: 3,
      createdAt: new Date(),
    });

    const { createMenuItem } = await import("./service");
    await createMenuItem({ location: "main-nav", label: "Sobre", href: "/sobre", actorId: "actor-1" });

    expect(insertMenuItem).toHaveBeenCalledWith({ menuId: "menu-1", label: "Sobre", href: "/sobre", order: 3 });
  });
});
