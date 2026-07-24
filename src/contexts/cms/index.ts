export { createContentTypeHandler as createContentType } from "./features/content-types/create-content-type/handler";
export { listContentTypesHandler as listContentTypes } from "./features/content-types/list-content-types/handler";
export { createCategoryHandler as createCategory } from "./features/categories/create-category/handler";
export { listCategoriesHandler as listCategories } from "./features/categories/list-categories/handler";
export { createEntryHandler as createEntry } from "./features/entries/create-entry/handler";
export { updateEntryHandler as updateEntry } from "./features/entries/update-entry/handler";
export { publishEntryHandler as publishEntry } from "./features/entries/publish-entry/handler";
export { listEntriesHandler as listEntries } from "./features/entries/list-entries/handler";
export { listEntriesForAdminHandler as listEntriesForAdmin } from "./features/entries/list-entries-for-admin/handler";
export { getEntryHandler as getEntry } from "./features/entries/get-entry/handler";
// Consumida por platform/media-lifecycle/delete-media-safely.ts (regra 12/14 — composição fora
// de cms e media, pra evitar ciclo com a validação de mediaId em create-entry/update-entry).
export { isMediaReferencedHandler as isMediaReferenced } from "./features/entries/is-media-referenced/handler";

export type { ContentTypeRecord, CategoryRecord, EntryRecord, EntryStatus } from "./contracts/types";

export type { CreateContentTypeInput, CreateContentTypeResult } from "./features/content-types/create-content-type/types";
export type { ListContentTypesResult } from "./features/content-types/list-content-types/types";
export type { CreateCategoryInput, CreateCategoryResult } from "./features/categories/create-category/types";
export type { ListCategoriesResult } from "./features/categories/list-categories/types";
export type { CreateEntryInput, CreateEntryResult } from "./features/entries/create-entry/types";
export type { UpdateEntryInput, UpdateEntryResult } from "./features/entries/update-entry/types";
export type { PublishEntryInput, PublishEntryResult } from "./features/entries/publish-entry/types";
export type { ListEntriesQuery, ListEntriesResult } from "./features/entries/list-entries/types";
export type {
  ListEntriesForAdminQuery,
  ListEntriesForAdminResult,
} from "./features/entries/list-entries-for-admin/types";
export type { GetEntryQuery, GetEntryResult } from "./features/entries/get-entry/types";
export type { IsMediaReferencedQuery, IsMediaReferencedResult } from "./features/entries/is-media-referenced/types";
