import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { programs } from "../../../database/schema";

export async function deleteProgramById(id: string): Promise<boolean> {
  const rows = await db.delete(programs).where(eq(programs.id, id)).returning({ id: programs.id });
  return rows.length > 0;
}
