import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { institutions } from "../../../database/schema";

// programs.institutionId tem onDelete: "cascade" (database/schema/index.ts) — apagar a
// instituição já leva junto todas as suas turmas/cursos, sem passo extra aqui.
export async function deleteInstitutionById(id: string): Promise<boolean> {
  const rows = await db.delete(institutions).where(eq(institutions.id, id)).returning({ id: institutions.id });
  return rows.length > 0;
}
