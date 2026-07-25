export { createContentTypeHandler as createContentType } from "./features/content-types/create-content-type/handler";
export { listContentTypesHandler as listContentTypes } from "./features/content-types/list-content-types/handler";
export { createCategoryHandler as createCategory } from "./features/categories/create-category/handler";
export { listCategoriesHandler as listCategories } from "./features/categories/list-categories/handler";
export { getCategoryBySlugHandler as getCategoryBySlug } from "./features/categories/get-category-by-slug/handler";
export { createEntryHandler as createEntry } from "./features/entries/create-entry/handler";
export { updateEntryHandler as updateEntry } from "./features/entries/update-entry/handler";
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

export { createMenuItemHandler as createMenuItem } from "./features/menus/create-menu-item/handler";
export { removeMenuItemHandler as removeMenuItem } from "./features/menus/remove-menu-item/handler";
export { reorderMenuItemsHandler as reorderMenuItems } from "./features/menus/reorder-menu-items/handler";
// Leitura pública, sem authorizeActor — consumida por platform/theme-rendering para resolver o
// main-nav a partir de dado real do CMS.
export { getMenuByLocationHandler as getMenuByLocation } from "./features/menus/get-menu-by-location/handler";

export type { ContentTypeRecord, CategoryRecord, EntryRecord, EntryStatus, MenuRecord, MenuItemRecord } from "./contracts/types";
export { getEntryBody } from "./contracts/entry-body";

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
export type { CreateMenuItemInput, CreateMenuItemResult } from "./features/menus/create-menu-item/types";
export type { RemoveMenuItemInput, RemoveMenuItemResult } from "./features/menus/remove-menu-item/types";
export type { ReorderMenuItemsInput, ReorderMenuItemsResult } from "./features/menus/reorder-menu-items/types";
export type { GetMenuByLocationQuery, GetMenuByLocationResult } from "./features/menus/get-menu-by-location/types";
