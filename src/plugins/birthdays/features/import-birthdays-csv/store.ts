import { db } from "@/infrastructure/database/client";
import { birthdayImports, birthdays } from "../../database/schema";
import { birthdayDuplicateKey } from "../../shared/csv-import/duplicate-key";
import type { NormalizedCsvRow } from "../../shared/csv-import/validate-csv-row";
import type { BirthdaysCsvImportOutcome, SkippedCsvRow } from "./types";

// Tudo em uma única transação: releitura das chaves existentes, inserção das linhas válidas e o
// registro de auditoria. Uma linha ruim não derruba as outras — só as que falharam na validação
// (já filtradas antes de chegar aqui) ou que são duplicata (quando includeDuplicates é false)
// ficam de fora do insert.
export async function commitBirthdaysCsvImport(input: {
  rows: NormalizedCsvRow[];
  includeDuplicates: boolean;
  actorId: string;
  totalRows: number;
  skippedErrorRows: SkippedCsvRow[];
}): Promise<BirthdaysCsvImportOutcome> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ fullName: birthdays.fullName, month: birthdays.month, day: birthdays.day })
      .from(birthdays);
    const seenKeys = new Set(existing.map((row) => birthdayDuplicateKey(row.fullName, row.month, row.day)));

    const toInsert: (typeof birthdays.$inferInsert)[] = [];
    const skippedDuplicates: SkippedCsvRow[] = [];

    for (const row of input.rows) {
      const key = birthdayDuplicateKey(row.fullName, row.month, row.day);
      const isDuplicate = seenKeys.has(key);

      if (isDuplicate && !input.includeDuplicates) {
        skippedDuplicates.push({
          lineNumber: row.lineNumber,
          reason: `Linha ${row.lineNumber}: duplicata de "${row.fullName}" (${row.month}/${row.day}), já cadastrado.`,
        });
        continue;
      }

      seenKeys.add(key);
      toInsert.push({
        fullName: row.fullName,
        role: row.role,
        locality: row.locality,
        month: row.month,
        day: row.day,
        createdByUserId: input.actorId,
      });
    }

    if (toInsert.length > 0) {
      await tx.insert(birthdays).values(toInsert);
    }

    await tx.insert(birthdayImports).values({
      importedByUserId: input.actorId,
      totalRows: input.totalRows,
      insertedRows: toInsert.length,
      skippedErrorRows: input.skippedErrorRows.length,
      skippedDuplicateRows: skippedDuplicates.length,
      includedDuplicates: input.includeDuplicates,
    });

    const skipped = [...input.skippedErrorRows, ...skippedDuplicates].sort((a, b) => a.lineNumber - b.lineNumber);

    return {
      totalRows: input.totalRows,
      insertedCount: toInsert.length,
      skippedDuplicateCount: skippedDuplicates.length,
      skippedErrorCount: input.skippedErrorRows.length,
      skipped,
    };
  });
}
