import { db } from "@/infrastructure/database/client";
import { birthdays } from "../../database/schema";
import type { BirthdayRecord } from "../../contracts/types";

export async function insertBirthday(input: {
  fullName: string;
  role: string | null;
  locality: string;
  month: number;
  day: number;
  createdByUserId: string;
}): Promise<BirthdayRecord> {
  const [row] = await db.insert(birthdays).values(input).returning();
  return row as BirthdayRecord;
}
