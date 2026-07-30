import { authorizeActor } from "@/contexts/rbac";
import { importBirthdaysCsv } from "./service";
import { validateImportBirthdaysCsvInput } from "./validation";
import type { ImportBirthdaysCsvInput, ImportBirthdaysCsvResult } from "./types";

export async function importBirthdaysCsvHandler(input: ImportBirthdaysCsvInput): Promise<ImportBirthdaysCsvResult> {
  const validationError = validateImportBirthdaysCsvInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("birthdays.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return importBirthdaysCsv({
    fileBuffer: input.fileBuffer,
    includeDuplicates: input.includeDuplicates ?? false,
    actorId: authz.actorId,
  });
}
