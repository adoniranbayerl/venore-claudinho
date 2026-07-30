import { validateCsvFileSize } from "../../shared/csv-import/limits";
import type { PreviewBirthdaysCsvImportInput } from "./types";

export function validatePreviewBirthdaysCsvImportInput(input: PreviewBirthdaysCsvImportInput) {
  return validateCsvFileSize(input.fileBuffer);
}
