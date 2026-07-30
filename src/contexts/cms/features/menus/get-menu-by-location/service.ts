import { getCache, setCache } from "@/infrastructure/cache/memory-cache";
import { getActorPermissionKeys } from "../../../actor-permission-keys";
import { filterMenuTreeByPermission, resolvePublicMenuTree } from "../../../menu-resolution";
import type { PreResolvedMenuItem } from "../../../menu-resolution";
import type { MenuItemRecord } from "../../../contracts/types";
import { findEntryRouteInfoByIds, findMenuByLocation, findMenuItemsByMenuId } from "./store";
import type { GetMenuByLocationQuery, GetMenuByLocationResult } from "./types";

const MENU_BY_LOCATION_CACHE_TTL_SECONDS = 60;

function isContentItem(item: MenuItemRecord): item is MenuItemRecord & { targetType: "content"; contentId: string } {
  return item.targetType === "content";
}

function cacheKeyFor(location: string): string {
  // Prefixo "cms:navigation" de propósito: toda escrita de menu/item, publish-entry e
  // update-entry chamam invalidateCacheByPrefix("cms:navigation") — ver
  // src/contexts/cms/features/menus/*/service.ts e entries/publish-entry|update-entry. Cacheado
  // aqui é só o resultado independente de ator (conteúdo/visibilidade) — permission é filtrada
  // depois do cache, por request (ver menu-resolution.ts).
  return `cms:navigation:by-location:${location}`;
}

async function resolvePreFilteredTree(location: GetMenuByLocationQuery["location"]): Promise<PreResolvedMenuItem[]> {
  const cacheKey = cacheKeyFor(location);
  const cached = getCache<PreResolvedMenuItem[]>(cacheKey);
  if (cached) return cached;

  const menu = await findMenuByLocation(location);
  if (!menu) {
    setCache(cacheKey, [], MENU_BY_LOCATION_CACHE_TTL_SECONDS);
    return [];
  }

  const rawItems = await findMenuItemsByMenuId(menu.id);
  const contentIds = rawItems.filter(isContentItem).map((item) => item.contentId);
  const entriesById = await findEntryRouteInfoByIds(contentIds);

  const resolved = resolvePublicMenuTree(rawItems, entriesById);
  setCache(cacheKey, resolved, MENU_BY_LOCATION_CACHE_TTL_SECONDS);

  return resolved;
}

export async function getMenuByLocation(query: GetMenuByLocationQuery): Promise<GetMenuByLocationResult> {
  const [preResolved, actorPermissionKeys] = await Promise.all([
    resolvePreFilteredTree(query.location),
    getActorPermissionKeys(),
  ]);

  return { success: true, data: filterMenuTreeByPermission(preResolved, actorPermissionKeys) };
}
