import type { BirthdaysCsvImportOutcome, BirthdaysCsvImportReport } from "@/plugins/birthdays";

export type PreviewBirthdaysCsvImportState = { error: string | null; report: BirthdaysCsvImportReport | null };
export type ImportBirthdaysCsvActionState = { error: string | null; outcome: BirthdaysCsvImportOutcome | null };

export function birthdaysCsvImportInitialPreviewState(): PreviewBirthdaysCsvImportState {
  return { error: null, report: null };
}

export function birthdaysCsvImportInitialState(): ImportBirthdaysCsvActionState {
  return { error: null, outcome: null };
}
