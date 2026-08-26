import { and, eq, max } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { institutions, programs } from "../../../database/schema";
import type { ProgramRecord } from "../../../contracts/types";

// Checado explicitamente antes do insert (em vez de deixar a FK constraint estourar) pra devolver
// um OperationResult com mensagem legível, não uma exception de infra vazando pro form.
export async function institutionExists(institutionId: string): Promise<boolean> {
  const [row] = await db.select({ id: institutions.id }).from(institutions).where(eq(institutions.id, institutionId)).limit(1);
  return Boolean(row);
}

export async function programKeyExists(institutionId: string, key: string): Promise<boolean> {
  const [row] = await db
    .select({ id: programs.id })
    .from(programs)
    .where(and(eq(programs.institutionId, institutionId), eq(programs.key, key)))
    .limit(1);
  return Boolean(row);
}

export async function nextProgramPosition(institutionId: string): Promise<number> {
  const [row] = await db
    .select({ maxPosition: max(programs.position) })
    .from(programs)
    .where(eq(programs.institutionId, institutionId));
  return (row?.maxPosition ?? 0) + 1;
}

export async function insertProgram(input: {
  institutionId: string;
  key: string;
  label: string;
  groupLabel: string | null;
  goal: number;
  renewed: number;
  newEnrollments: number;
  position: number;
}): Promise<ProgramRecord> {
  const [row] = await db.insert(programs).values(input).returning();
  return row as ProgramRecord;
}
