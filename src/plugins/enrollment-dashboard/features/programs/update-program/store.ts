import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { programs } from "../../../database/schema";
import type { ProgramRecord } from "../../../contracts/types";

export async function findProgramById(id: string): Promise<ProgramRecord | null> {
  const [row] = await db.select().from(programs).where(eq(programs.id, id)).limit(1);
  return (row as ProgramRecord) ?? null;
}

// key/institutionId nunca entram no set — key é estável (ver create-program/service.ts), e mover
// um program entre instituições não é uma operação suportada (excluir e recriar, se precisar).
export async function applyProgramUpdate(input: {
  id: string;
  label: string;
  groupLabel: string | null;
  goal: number;
  renewed: number;
  newEnrollments: number;
}): Promise<ProgramRecord> {
  const [row] = await db
    .update(programs)
    .set({
      label: input.label,
      groupLabel: input.groupLabel,
      goal: input.goal,
      renewed: input.renewed,
      newEnrollments: input.newEnrollments,
      updatedAt: sql`now()`,
    })
    .where(eq(programs.id, input.id))
    .returning();

  return row as ProgramRecord;
}
