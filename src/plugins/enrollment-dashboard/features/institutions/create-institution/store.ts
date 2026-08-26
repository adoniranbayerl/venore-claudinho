import { eq, max } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { institutions } from "../../../database/schema";
import type { InstitutionRecord } from "../../../contracts/types";

export async function institutionKeyExists(key: string): Promise<boolean> {
  const [row] = await db.select({ id: institutions.id }).from(institutions).where(eq(institutions.key, key)).limit(1);
  return Boolean(row);
}

export async function nextInstitutionPosition(): Promise<number> {
  const [row] = await db.select({ maxPosition: max(institutions.position) }).from(institutions);
  return (row?.maxPosition ?? 0) + 1;
}

export async function insertInstitution(input: {
  key: string;
  name: string;
  logoMediaId: string | null;
  programLabel: string;
  position: number;
}): Promise<InstitutionRecord> {
  const [row] = await db.insert(institutions).values(input).returning();
  return row as InstitutionRecord;
}
