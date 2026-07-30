import { beforeEach, describe, expect, it, vi } from "vitest";

const findAllMenusWithItemCount = vi.fn();
vi.mock("./store", () => ({
  findAllMenusWithItemCount: (...args: unknown[]) => findAllMenusWithItemCount(...args),
}));

describe("listMenus", () => {
  beforeEach(() => {
    findAllMenusWithItemCount.mockReset();
  });

  it("returns every menu with its item count", async () => {
    findAllMenusWithItemCount.mockResolvedValue([{ id: "menu-1", key: "main", name: "Principal", location: "main", scopePath: null, itemCount: 3 }]);

    const { listMenus } = await import("./service");
    const result = await listMenus();

    expect(result).toEqual({
      success: true,
      data: [{ id: "menu-1", key: "main", name: "Principal", location: "main", scopePath: null, itemCount: 3 }],
    });
  });
});
