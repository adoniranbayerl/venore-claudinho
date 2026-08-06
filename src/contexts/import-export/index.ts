export { importExportAdminNavigationItems } from "./admin-navigation";

// Genéricos o bastante (não amarrados a ExportManifest/CMS) pra outro context/plugin reaproveitar
// o mesmo envelope .zip e o mesmo remap de `data.mediaId` em composição sem duplicar a lógica —
// ver academy/features/courses/{export,import}-course-bundle.
export { buildExportZip, parseExportZip, type ZipFileEntry } from "./zip-codec";
export { remapCompositionMediaIds } from "./composition-media-refs";

export { exportSiteBundleHandler as exportSiteBundle } from "./features/export-site/export-site-bundle/handler";
export { toExportZip } from "./features/export-site/export-site-bundle/view";
export type { ExportSiteBundleData, ExportSiteBundleResult } from "./features/export-site/export-site-bundle/types";

export { importSiteBundleHandler as importSiteBundle } from "./features/import-site/import-site-bundle/handler";
export type { ImportSiteBundleHandlerInput } from "./features/import-site/import-site-bundle/handler";
export type { ImportSiteBundleResult } from "./features/import-site/import-site-bundle/types";

export type {
  ExportManifest,
  ImportReport,
  ImportReportLine,
  ImportReportLineKind,
  ImportReportOutcome,
} from "./contracts/types";
export { IMPORT_EXPORT_FORMAT, IMPORT_EXPORT_FORMAT_VERSION, IMPORT_EXPORT_REQUIRED_PERMISSIONS } from "./contracts/types";
