import { MAX_IMPORT_ROWS, maxImportRowsMessage } from "../../shared/csv-import/limits";
import { birthdayDuplicateKey } from "../../shared/csv-import/duplicate-key";
import { parseBirthdaysCsv } from "../../shared/csv-import/parse-birthdays-csv";
import { validateCsvRow } from "../../shared/csv-import/validate-csv-row";
import { findExistingBirthdayKeys } from "./store";
import type { CsvRowPreview, PreviewBirthdaysCsvImportInput, PreviewBirthdaysCsvImportResult } from "./types";

export async function previewBirthdaysCsvImport(
  input: PreviewBirthdaysCsvImportInput,
): Promise<PreviewBirthdaysCsvImportResult> {
  const parsed = parseBirthdaysCsv(input.fileBuffer);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  if (parsed.rows.length > MAX_IMPORT_ROWS) {
    return {
      success: false,
      error: { code: "birthdays.csv_too_many_rows", message: maxImportRowsMessage(parsed.rows.length) },
    };
  }

  const seenKeys = await findExistingBirthdayKeys();

  const rows: CsvRowPreview[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  for (const rawRow of parsed.rows) {
    const validated = validateCsvRow(rawRow);
    if (validated.error) {
      errorCount += 1;
      rows.push({
        lineNumber: validated.error.lineNumber,
        status: "error",
        errorCode: validated.error.code,
        errorMessage: validated.error.message,
      });
      continue;
    }

    const key = birthdayDuplicateKey(validated.data.fullName, validated.data.month, validated.data.day);
    const isDuplicate = seenKeys.has(key);
    if (isDuplicate) {
      duplicateCount += 1;
    } else {
      validCount += 1;
      seenKeys.add(key);
    }

    rows.push({
      lineNumber: validated.data.lineNumber,
      status: isDuplicate ? "duplicate" : "valid",
      fullName: validated.data.fullName,
      role: validated.data.role,
      locality: validated.data.locality,
      month: validated.data.month,
      day: validated.data.day,
    });
  }

  return {
    success: true,
    data: {
      encoding: parsed.encoding,
      totalRows: parsed.rows.length,
      validCount,
      duplicateCount,
      errorCount,
      rows,
    },
  };
}
