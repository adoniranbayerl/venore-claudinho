import { beginOperation, endOperation } from "@/observability";
import { MAX_IMPORT_ROWS, maxImportRowsMessage } from "../../shared/csv-import/limits";
import { parseBirthdaysCsv } from "../../shared/csv-import/parse-birthdays-csv";
import { validateCsvRow, type NormalizedCsvRow } from "../../shared/csv-import/validate-csv-row";
import { commitBirthdaysCsvImport } from "./store";
import type { ImportBirthdaysCsvCommand, ImportBirthdaysCsvResult, SkippedCsvRow } from "./types";

export async function importBirthdaysCsv(command: ImportBirthdaysCsvCommand): Promise<ImportBirthdaysCsvResult> {
  const handle = beginOperation({
    useCase: "birthdays.import-birthdays-csv",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const parsed = parseBirthdaysCsv(command.fileBuffer);
  if (!parsed.success) {
    endOperation(handle, { success: false, error: parsed.error });
    return { success: false, error: parsed.error };
  }

  if (parsed.rows.length > MAX_IMPORT_ROWS) {
    const error = { code: "birthdays.csv_too_many_rows", message: maxImportRowsMessage(parsed.rows.length) };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const validRows: NormalizedCsvRow[] = [];
  const skippedErrorRows: SkippedCsvRow[] = [];

  for (const rawRow of parsed.rows) {
    const validated = validateCsvRow(rawRow);
    if (validated.error) {
      skippedErrorRows.push({ lineNumber: validated.error.lineNumber, reason: validated.error.message });
      continue;
    }
    validRows.push(validated.data);
  }

  const outcome = await commitBirthdaysCsvImport({
    rows: validRows,
    includeDuplicates: command.includeDuplicates,
    actorId: command.actorId,
    totalRows: parsed.rows.length,
    skippedErrorRows,
  });

  endOperation(handle, { success: true });
  return { success: true, data: outcome };
}
