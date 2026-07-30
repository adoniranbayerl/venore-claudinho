import { validateCsvFileSize } from "../../shared/csv-import/limits";
import type { ImportBirthdaysCsvInput } from "./types";

export function validateImportBirthdaysCsvInput(input: ImportBirthdaysCsvInput) {
  return validateCsvFileSize(input.fileBuffer);
}
