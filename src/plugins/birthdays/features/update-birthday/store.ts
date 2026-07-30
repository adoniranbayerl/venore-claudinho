import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { birthdays } from "../../database/schema";
import type { BirthdayRecord } from "../../contracts/types";

export async function findBirthdayById(id: string): Promise<BirthdayRecord | null> {
  const [row] = await db.select().from(birthdays).where(eq(birthdays.id, id)).limit(1);
  return (row as BirthdayRecord) ?? null;
}

export async function applyBirthdayUpdate(input: {
  id: string;
  fullName: string;
  role: string | null;
  locality: string;
  month: number;
  day: number;
}): Promise<BirthdayRecord> {
  const [row] = await db
    .update(birthdays)
    .set({
      fullName: input.fullName,
      role: input.role,
      locality: input.locality,
      month: input.month,
      day: input.day,
      updatedAt: sql`now()`,
    })
    .where(eq(birthdays.id, input.id))
    .returning();

  return row as BirthdayRecord;
}
