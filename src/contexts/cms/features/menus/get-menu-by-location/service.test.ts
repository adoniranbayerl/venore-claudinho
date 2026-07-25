import { beforeEach, describe, expect, it, vi } from "vitest";

const findMenuByLocation = vi.fn();
const findMenuItemsByMenuId = vi.fn();

vi.mock("./store", () => ({
  findMenuByLocation: (...args: unknown[]) => findMenuByLocation(...args),
  findMenuItemsByMenuId: (...args: unknown[]) => findMenuItemsByMenuId(...args),
}));

describe("getMenuByLocation", () => {
  beforeEach(() => {
    findMenuByLocation.mockReset();
    findMenuItemsByMenuId.mockReset();
  });

  it("returns an empty menu without persisting when the location does not exist yet", async () => {
    findMenuByLocation.mockResolvedValue(null);

    const { getMenuByLocation } = await import("./service");
    const result = await getMenuByLocation({ location: "main-nav" });

    expect(result).toEqual({ success: true, data: { location: "main-nav", items: [] } });
    expect(findMenuItemsByMenuId).not.toHaveBeenCalled();
  });

  it("returns the menu items ordered by order when the location exists", async () => {
    findMenuByLocation.mockResolvedValue({ id: "menu-1" });
    findMenuItemsByMenuId.mockResolvedValue([
      { id: "item-1", menuId: "menu-1", label: "Home", href: "/", order: 0, createdAt: new Date() },
    ]);

    const { getMenuByLocation } = await import("./service");
    const result = await getMenuByLocation({ location: "main-nav" });

    expect(result.success).toBe(true);
    expect(findMenuItemsByMenuId).toHaveBeenCalledWith("menu-1");
  });
});
