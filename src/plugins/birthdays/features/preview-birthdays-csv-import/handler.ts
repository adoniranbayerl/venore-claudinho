import { authorizeActor } from "@/contexts/rbac";
import { previewBirthdaysCsvImport } from "./service";
import { validatePreviewBirthdaysCsvImportInput } from "./validation";
import type { PreviewBirthdaysCsvImportInput, PreviewBirthdaysCsvImportResult } from "./types";

export async function previewBirthdaysCsvImportHandler(
  input: PreviewBirthdaysCsvImportInput,
): Promise<PreviewBirthdaysCsvImportResult> {
  const validationError = validatePreviewBirthdaysCsvImportInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("birthdays.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return previewBirthdaysCsvImport(input);
}
