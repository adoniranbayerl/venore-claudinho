import { beforeEach, describe, expect, it, vi } from "vitest";

const findMenuById = vi.fn();
const findMenuItemsByMenuId = vi.fn();
const findEntryRouteInfoByIds = vi.fn();

vi.mock("./store", () => ({
  findMenuById: (...args: unknown[]) => findMenuById(...args),
  findMenuItemsByMenuId: (...args: unknown[]) => findMenuItemsByMenuId(...args),
  findEntryRouteInfoByIds: (...args: unknown[]) => findEntryRouteInfoByIds(...args),
}));

function contentItem(id: string, contentId: string) {
  return {
    id,
    menuId: "menu-1",
    parentId: null,
    label: id,
    order: 0,
    isVisible: true,
    targetType: "content" as const,
    contentId,
  };
}

describe("getMenuTree", () => {
  beforeEach(() => {
    findMenuById.mockReset().mockResolvedValue({ id: "menu-1", key: "main", name: "Principal", location: "main", scopePath: null });
    findMenuItemsByMenuId.mockReset();
    findEntryRouteInfoByIds.mockReset();
  });

  it("marks an item pointing at unpublished content as inactive-unpublished, with a reason", async () => {
    findMenuItemsByMenuId.mockResolvedValue([contentItem("item-1", "entry-1")]);
    findEntryRouteInfoByIds.mockResolvedValue(
      new Map([["entry-1", { id: "entry-1", title: "Rascunho", slug: "rascunho", categorySlug: null, status: "draft" }]]),
    );

    const { getMenuTree } = await import("./service");
    const result = await getMenuTree({ menuId: "menu-1" });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("expected success");
    expect(result.data.items[0]).toMatchObject({
      status: "inactive-unpublished",
      reason: expect.any(String),
      resolvedHref: null,
    });
  });

  it("marks an item pointing at a deleted entry as pending-deleted without breaking assembly", async () => {
    findMenuItemsByMenuId.mockResolvedValue([contentItem("item-1", "gone")]);
    findEntryRouteInfoByIds.mockResolvedValue(new Map());

    const { getMenuTree } = await import("./service");
    const result = await getMenuTree({ menuId: "menu-1" });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("expected success");
    expect(result.data.items[0]).toMatchObject({ status: "pending-deleted", reason: expect.any(String) });
  });

  it("marks a published content item as active with a resolved href", async () => {
    findMenuItemsByMenuId.mockResolvedValue([contentItem("item-1", "entry-1")]);
    findEntryRouteInfoByIds.mockResolvedValue(
      new Map([["entry-1", { id: "entry-1", title: "Programa 2026", slug: "programa-2026", categorySlug: "academy", status: "published" }]]),
    );

    const { getMenuTree } = await import("./service");
    const result = await getMenuTree({ menuId: "menu-1" });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error("expected success");
    expect(result.data.items[0]).toMatchObject({
      status: "active",
      resolvedHref: "/academy/programa-2026",
      label: "item-1",
      contentTitle: "Programa 2026",
    });
  });
});
