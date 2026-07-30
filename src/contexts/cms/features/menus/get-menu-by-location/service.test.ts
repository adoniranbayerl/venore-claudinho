import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/cache/memory-cache", async () => {
  const store = new Map<string, { value: unknown; expiresAt: number }>();
  return {
    getCache: (key: string) => {
      const entry = store.get(key);
      if (!entry || Date.now() > entry.expiresAt) return null;
      return entry.value;
    },
    setCache: (key: string, value: unknown, ttlSeconds: number) => {
      store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    },
    invalidateCacheByPrefix: (prefix: string) => {
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
      }
    },
    __store: store,
  };
});

const getActorPermissionKeys = vi.fn();
vi.mock("../../../actor-permission-keys", () => ({
  getActorPermissionKeys: (...args: unknown[]) => getActorPermissionKeys(...args),
}));

const findMenuByLocation = vi.fn();
const findMenuItemsByMenuId = vi.fn();
const findEntryRouteInfoByIds = vi.fn();

vi.mock("./store", () => ({
  findMenuByLocation: (...args: unknown[]) => findMenuByLocation(...args),
  findMenuItemsByMenuId: (...args: unknown[]) => findMenuItemsByMenuId(...args),
  findEntryRouteInfoByIds: (...args: unknown[]) => findEntryRouteInfoByIds(...args),
}));

describe("getMenuByLocation", () => {
  beforeEach(async () => {
    findMenuByLocation.mockReset();
    findMenuItemsByMenuId.mockReset();
    findEntryRouteInfoByIds.mockReset().mockResolvedValue(new Map());
    getActorPermissionKeys.mockReset().mockResolvedValue(new Set());
    const cache = (await import("@/infrastructure/cache/memory-cache")) as unknown as { __store: Map<string, unknown> };
    cache.__store.clear();
  });

  it("returns an empty list when there is no menu for the location (never falls back)", async () => {
    findMenuByLocation.mockResolvedValue(null);

    const { getMenuByLocation } = await import("./service");
    const result = await getMenuByLocation({ location: "header" });

    expect(result).toEqual({ success: true, data: [] });
  });

  it("filters a route item requiring a permission the actor does not have", async () => {
    findMenuByLocation.mockResolvedValue({ id: "menu-1", key: "main", name: "Principal", location: "main", scopePath: null });
    findMenuItemsByMenuId.mockResolvedValue([
      {
        id: "item-1",
        menuId: "menu-1",
        parentId: null,
        label: "Admin",
        order: 0,
        isVisible: true,
        targetType: "route",
        routePath: "/admin",
        requiredPermissionKey: "platform.admin.access",
      },
    ]);
    getActorPermissionKeys.mockResolvedValue(new Set());

    const { getMenuByLocation } = await import("./service");
    const result = await getMenuByLocation({ location: "main" });

    expect(result).toEqual({ success: true, data: [] });
  });

  it("caches the content-dependent resolution independently of the actor's permissions", async () => {
    findMenuByLocation.mockResolvedValue({ id: "menu-1", key: "main", name: "Principal", location: "main", scopePath: null });
    findMenuItemsByMenuId.mockResolvedValue([
      {
        id: "item-1",
        menuId: "menu-1",
        parentId: null,
        label: "Admin",
        order: 0,
        isVisible: true,
        targetType: "route",
        routePath: "/admin",
        requiredPermissionKey: "platform.admin.access",
      },
    ]);

    const { getMenuByLocation } = await import("./service");

    getActorPermissionKeys.mockResolvedValue(new Set());
    const asAnonymous = await getMenuByLocation({ location: "main" });
    expect(asAnonymous).toEqual({ success: true, data: [] });

    // Só um fetch de DB deve ter ocorrido (segunda chamada reaproveita o cache), mas o resultado
    // filtrado por ator é recalculado por request — um admin vê o item mesmo com o mesmo cache.
    getActorPermissionKeys.mockResolvedValue(new Set(["platform.admin.access"]));
    const asAdmin = await getMenuByLocation({ location: "main" });
    expect(asAdmin.success).toBe(true);
    if (asAdmin.success) {
      expect(asAdmin.data).toHaveLength(1);
      expect(asAdmin.data[0]).toMatchObject({ href: "/admin" });
    }

    expect(findMenuItemsByMenuId).toHaveBeenCalledTimes(1);
  });

  it("carries the item's icon through to the resolved menu, and null when it has none", async () => {
    findMenuByLocation.mockResolvedValue({ id: "menu-1", key: "main", name: "Principal", location: "main", scopePath: null });
    findMenuItemsByMenuId.mockResolvedValue([
      {
        id: "item-1",
        menuId: "menu-1",
        parentId: null,
        label: "Recursos Humanos",
        order: 0,
        isVisible: true,
        targetType: "label",
        icon: "users",
      },
      {
        id: "item-2",
        menuId: "menu-1",
        parentId: null,
        label: "Teologia",
        order: 1,
        isVisible: true,
        targetType: "route",
        routePath: "/teologia",
        requiredPermissionKey: null,
        icon: null,
      },
    ]);

    const { getMenuByLocation } = await import("./service");
    const result = await getMenuByLocation({ location: "main" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0]).toMatchObject({ label: "Recursos Humanos", icon: "users" });
      expect(result.data[1]).toMatchObject({ label: "Teologia", icon: null });
    }
  });
});
