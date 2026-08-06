import type { ImportReportOutcome } from "@/contexts/import-export";
import type { OperationResult } from "@/shared/types";

export type AcademyImportReportLineKind = "course" | "lesson" | "media-asset";

export type AcademyImportReportLine = {
  kind: AcademyImportReportLineKind;
  ref: string;
  outcome: ImportReportOutcome;
  message?: string;
};

export type AcademyImportReport = {
  lines: AcademyImportReportLine[];
  createdCount: number;
  reusedCount: number;
  skippedCount: number;
  failedCount: number;
};

export type ImportCourseBundleCommand = { manifest: unknown; files: Map<string, Buffer>; actorId: string };
export type ImportCourseBundleInput = Omit<ImportCourseBundleCommand, "actorId">;
export type ImportCourseBundleResult = OperationResult<AcademyImportReport>;
