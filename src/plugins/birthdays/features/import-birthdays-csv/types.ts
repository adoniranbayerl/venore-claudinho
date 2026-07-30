import type { OperationResult } from "@/shared/types";

export type ImportBirthdaysCsvCommand = {
  fileBuffer: Buffer;
  includeDuplicates: boolean;
  actorId: string;
};

export type ImportBirthdaysCsvInput = {
  fileBuffer: Buffer;
  includeDuplicates?: boolean;
};

export type SkippedCsvRow = { lineNumber: number; reason: string };

export type BirthdaysCsvImportOutcome = {
  totalRows: number;
  insertedCount: number;
  skippedDuplicateCount: number;
  skippedErrorCount: number;
  skipped: SkippedCsvRow[];
};

export type ImportBirthdaysCsvResult = OperationResult<BirthdaysCsvImportOutcome>;
