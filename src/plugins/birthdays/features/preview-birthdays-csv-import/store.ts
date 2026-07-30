import { db } from "@/infrastructure/database/client";
import { birthdays } from "../../database/schema";
import { birthdayDuplicateKey } from "../../shared/csv-import/duplicate-key";

export async function findExistingBirthdayKeys(): Promise<Set<string>> {
  const rows = await db
    .select({ fullName: birthdays.fullName, month: birthdays.month, day: birthdays.day })
    .from(birthdays);

  return new Set(rows.map((row) => birthdayDuplicateKey(row.fullName, row.month, row.day)));
}
