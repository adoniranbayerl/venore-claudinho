export { createContentTypeHandler as createContentType } from "./features/content-types/create-content-type/handler";
export { listContentTypesHandler as listContentTypes } from "./features/content-types/list-content-types/handler";
export { createCategoryHandler as createCategory } from "./features/categories/create-category/handler";
export { listCategoriesHandler as listCategories } from "./features/categories/list-categories/handler";
export { getCategoryBySlugHandler as getCategoryBySlug } from "./features/categories/get-category-by-slug/handler";
export { createEntryHandler as createEntry } from "./features/entries/create-entry/handler";
export { updateEntryHandler as updateEntry } from "./features/entries/update-entry/handler";
export {
  updateEntryCompositionHandler as updateEntryComposition,
} from "./features/entries/update-entry-composition/handler";
export {
  getEntryCompositionHandler as getEntryComposition,
} from "./features/entries/get-entry-composition/handler";
export { publishEntryHandler as publishEntry } from "./features/entries/publish-entry/handler";
export { listEntriesHandler as listEntries } from "./features/entries/list-entries/handler";
export { listEntriesForAdminHandler as listEntriesForAdmin } from "./features/entries/list-entries-for-admin/handler";
export { getEntryHandler as getEntry } from "./features/entries/get-entry/handler";
export {
  getPublishedEntryBySlugHandler as getPublishedEntryBySlug,
} from "./features/entries/get-published-entry-by-slug/handler";
// Consumida por platform/media-lifecycle/delete-media-safely.ts (regra 12/14 — composição fora
// de cms e media, pra evitar ciclo com a validação de mediaId em create-entry/update-entry).
export { isMediaReferencedHandler as isMediaReferenced } from "./features/entries/is-media-referenced/handler";

export { createMenuHandler as createMenu } from "./features/menus/create-menu/handler";
export { updateMenuHandler as updateMenu } from "./features/menus/update-menu/handler";
export { deleteMenuHandler as deleteMenu } from "./features/menus/delete-menu/handler";
export { listMenusHandler as listMenus } from "./features/menus/list-menus/handler";
export { getMenuTreeHandler as getMenuTree } from "./features/menus/get-menu-tree/handler";
export { createMenuItemHandler as createMenuItem } from "./features/menus/create-menu-item/handler";
export { updateMenuItemHandler as updateMenuItem } from "./features/menus/update-menu-item/handler";
export { moveMenuItemHandler as moveMenuItem } from "./features/menus/move-menu-item/handler";
export { removeMenuItemHandler as removeMenuItem } from "./features/menus/remove-menu-item/handler";
// Leitura pública, sem authorizeActor — consumida por platform/theme-rendering pra resolver
// main-nav/header-nav/sitemap a partir de dado real do CMS (não integrado ao shell nesta sessão).
export { getMenuByLocationHandler as getMenuByLocation } from "./features/menus/get-menu-by-location/handler";
// Leitura pública, sem authorizeActor — resolve o menu contextual pela rota atual (scopePath de
// correspondência mais longa). Sem correspondência, devolve lista vazia — nunca cai pro main-nav.
export { getContextualMenuHandler as getContextualMenu } from "./features/menus/get-contextual-menu/handler";

export { cmsAdminNavigationItems } from "./admin-navigation";
export { cmsBreadcrumbSegments, getCachedEntry, getCachedMenuTree } from "./breadcrumbs";

export type {
  ContentTypeRecord,
  CategoryRecord,
  EntryRecord,
  EntryStatus,
  MenuRecord,
  MenuItemRecord,
  MenuLocation,
  MenuItemTarget,
} from "./contracts/types";
export type { ResolvedMenuItem, AdminResolvedMenuItem, AdminMenuItemStatus } from "./menu-resolution";
export { MAX_MENU_ITEM_DEPTH } from "./menu-tree";
export { getEntryBody } from "./contracts/entry-body";
export type { Block, Area, Composition } from "./contracts/block";
export { blockSchema, areaSchema, compositionSchema } from "./contracts/block";
export { validateComposition } from "./validate-composition";
export type { ValidateCompositionError, ValidateCompositionResult } from "./validate-composition";
export { isBlockConfigured } from "./contracts/block-config";
export type {
  BlockDefinition,
  BlockStructure,
  AreaDefinition,
  EditorField,
  EditorFieldType,
  ResolveBlockDefinition,
} from "./contracts/block-definition";

export type { CreateContentTypeInput, CreateContentTypeResult } from "./features/content-types/create-content-type/types";
export type { ListContentTypesResult } from "./features/content-types/list-content-types/types";
export type { CreateCategoryInput, CreateCategoryResult } from "./features/categories/create-category/types";
export type { ListCategoriesResult } from "./features/categories/list-categories/types";
export type {
  GetCategoryBySlugQuery,
  GetCategoryBySlugResult,
} from "./features/categories/get-category-by-slug/types";
export type { CreateEntryInput, CreateEntryResult } from "./features/entries/create-entry/types";
export type { UpdateEntryInput, UpdateEntryResult } from "./features/entries/update-entry/types";
export type {
  UpdateEntryCompositionInput,
  UpdateEntryCompositionResult,
} from "./features/entries/update-entry-composition/types";
export type {
  GetEntryCompositionQuery,
  GetEntryCompositionResult,
} from "./features/entries/get-entry-composition/types";
export type { PublishEntryInput, PublishEntryResult } from "./features/entries/publish-entry/types";
export type { ListEntriesQuery, ListEntriesResult } from "./features/entries/list-entries/types";
export type {
  ListEntriesForAdminQuery,
  ListEntriesForAdminResult,
} from "./features/entries/list-entries-for-admin/types";
export type { GetEntryQuery, GetEntryResult } from "./features/entries/get-entry/types";
export type {
  GetPublishedEntryBySlugQuery,
  GetPublishedEntryBySlugResult,
} from "./features/entries/get-published-entry-by-slug/types";
export type { IsMediaReferencedQuery, IsMediaReferencedResult } from "./features/entries/is-media-referenced/types";
export type { CreateMenuInput, CreateMenuResult } from "./features/menus/create-menu/types";
export type { UpdateMenuInput, UpdateMenuResult } from "./features/menus/update-menu/types";
export type { DeleteMenuInput, DeleteMenuResult } from "./features/menus/delete-menu/types";
export type { ListMenusResult } from "./features/menus/list-menus/types";
export type { GetMenuTreeQuery, GetMenuTreeResult } from "./features/menus/get-menu-tree/types";
export type { CreateMenuItemInput, CreateMenuItemResult } from "./features/menus/create-menu-item/types";
export type { UpdateMenuItemInput, UpdateMenuItemResult } from "./features/menus/update-menu-item/types";
export type { MoveMenuItemInput, MoveMenuItemResult } from "./features/menus/move-menu-item/types";
export type { RemoveMenuItemInput, RemoveMenuItemResult } from "./features/menus/remove-menu-item/types";
export type { GetMenuByLocationQuery, GetMenuByLocationResult } from "./features/menus/get-menu-by-location/types";
export type { GetContextualMenuQuery, GetContextualMenuResult } from "./features/menus/get-contextual-menu/types";
