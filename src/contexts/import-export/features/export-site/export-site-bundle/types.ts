import type { OperationResult } from "@/shared/types";
import type { ExportManifest } from "../../../contracts/types";

export type ExportSiteBundleAssetFile = { path: string; data: Buffer };
export type ExportSiteBundleData = { manifest: ExportManifest; files: ExportSiteBundleAssetFile[] };
export type ExportSiteBundleResult = OperationResult<ExportSiteBundleData>;
