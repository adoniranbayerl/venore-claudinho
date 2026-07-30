export { birthdaysBreadcrumbSegments } from "./breadcrumbs";
export { createBirthdayHandler as createBirthday } from "./features/create-birthday/handler";
export { updateBirthdayHandler as updateBirthday } from "./features/update-birthday/handler";
export { deleteBirthdayHandler as deleteBirthday } from "./features/delete-birthday/handler";
export { listBirthdaysHandler as listBirthdays } from "./features/list-birthdays/handler";
export {
  listPublicBirthdaysHandler as listPublicBirthdays,
} from "./features/list-public-birthdays/handler";
export {
  getBirthdayAppearanceHandler as getBirthdayAppearance,
} from "./features/get-birthday-appearance/handler";
export {
  previewBirthdaysCsvImportHandler as previewBirthdaysCsvImport,
} from "./features/preview-birthdays-csv-import/handler";
export {
  importBirthdaysCsvHandler as importBirthdaysCsv,
} from "./features/import-birthdays-csv/handler";

// Ponto de extensão "blocks" do plugin engine, mesmo padrão do academy (src/plugins/academy/
// index.ts): platform/page-builder/block-registry.ts importa blockDefinitions (dado,
// serializável) e block-renderers.tsx importa blockRenderers (componente) — dois registries
// paralelos, nunca misturados.
export { blockDefinitions, blockRenderers } from "./blocks";

export { MONTH_LABELS } from "./shared/months";
export { BIRTHDAY_APPEARANCE_SETTINGS, DEFAULT_BIRTHDAY_APPEARANCE } from "./shared/appearance";
export type { BirthdayAppearanceField, BirthdayAppearanceSettings } from "./shared/appearance";
export { generateBirthdaysCsvTemplate } from "./shared/csv-import/csv-template";

export type { BirthdayRecord } from "./contracts/types";
export type { CreateBirthdayInput, CreateBirthdayResult } from "./features/create-birthday/types";
export type { UpdateBirthdayInput, UpdateBirthdayResult } from "./features/update-birthday/types";
export type { DeleteBirthdayInput, DeleteBirthdayResult } from "./features/delete-birthday/types";
export type { BirthdayAdminView, ListBirthdaysResult } from "./features/list-birthdays/types";
export type {
  PublicBirthdayView,
  ListPublicBirthdaysResult,
} from "./features/list-public-birthdays/types";
export type { GetBirthdayAppearanceResult } from "./features/get-birthday-appearance/types";
export type {
  BirthdaysCsvImportReport,
  CsvRowPreview,
  PreviewBirthdaysCsvImportResult,
} from "./features/preview-birthdays-csv-import/types";
export type {
  BirthdaysCsvImportOutcome,
  ImportBirthdaysCsvResult,
  SkippedCsvRow,
} from "./features/import-birthdays-csv/types";
