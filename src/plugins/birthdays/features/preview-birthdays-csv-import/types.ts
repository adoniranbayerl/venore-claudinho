import type { OperationResult } from "@/shared/types";
import type { CsvEncoding } from "../../shared/csv-import/decode-csv-bytes";

export type PreviewBirthdaysCsvImportInput = {
  fileBuffer: Buffer;
};

export type CsvRowPreview =
  | {
      lineNumber: number;
      status: "valid" | "duplicate";
      fullName: string;
      role: string | null;
      locality: string;
      month: number;
      day: number;
    }
  | {
      lineNumber: number;
      status: "error";
      errorCode: string;
      errorMessage: string;
    };

export type BirthdaysCsvImportReport = {
  encoding: CsvEncoding;
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  errorCount: number;
  rows: CsvRowPreview[];
};

export type PreviewBirthdaysCsvImportResult = OperationResult<BirthdaysCsvImportReport>;
