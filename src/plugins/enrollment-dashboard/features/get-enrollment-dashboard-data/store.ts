import { asc } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { institutions, programs } from "../../database/schema";
import type { InstitutionRecord, ProgramRecord } from "../../contracts/types";

export async function findAllInstitutionsWithPrograms(): Promise<{
  institutions: InstitutionRecord[];
  programs: ProgramRecord[];
}> {
  const [institutionRows, programRows] = await Promise.all([
    db.select().from(institutions).orderBy(asc(institutions.position)),
    db.select().from(programs).orderBy(asc(programs.position)),
  ]);

  return { institutions: institutionRows as InstitutionRecord[], programs: programRows as ProgramRecord[] };
}
