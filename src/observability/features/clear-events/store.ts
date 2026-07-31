import { count } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { observabilityEvents } from "../../database/schema";

export async function countAllEvents(): Promise<number> {
  const [{ value } = { value: 0 }] = await db.select({ value: count() }).from(observabilityEvents);
  return value;
}

export async function deleteAllEvents(): Promise<number> {
  const result = await db.delete(observabilityEvents);
  return result.rowCount ?? 0;
}
