import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { institutions } from "../../../database/schema";
import type { InstitutionRecord } from "../../../contracts/types";

export async function findInstitutionById(id: string): Promise<InstitutionRecord | null> {
  const [row] = await db.select().from(institutions).where(eq(institutions.id, id)).limit(1);
  return (row as InstitutionRecord) ?? null;
}

// key nunca entra no set — ver comentário em create-institution/service.ts sobre por que ela é
// estável depois de criada.
export async function applyInstitutionUpdate(input: {
  id: string;
  name: string;
  logoMediaId: string | null;
  programLabel: string;
}): Promise<InstitutionRecord> {
  const [row] = await db
    .update(institutions)
    .set({
      name: input.name,
      logoMediaId: input.logoMediaId,
      programLabel: input.programLabel,
      updatedAt: sql`now()`,
    })
    .where(eq(institutions.id, input.id))
    .returning();

  return row as InstitutionRecord;
}
