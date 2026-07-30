import { asc } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { birthdays } from "../../database/schema";
import type { BirthdayRecord } from "../../contracts/types";

export async function findAllBirthdays(): Promise<BirthdayRecord[]> {
  const rows = await db.select().from(birthdays).orderBy(asc(birthdays.month), asc(birthdays.day));
  return rows as BirthdayRecord[];
}
