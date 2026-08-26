import type { EnrollmentInstitution } from "../../contracts/types";
import { findAllInstitutionsWithPrograms } from "./store";
import type { GetEnrollmentDashboardDataResult } from "./types";

export async function getEnrollmentDashboardData(): Promise<GetEnrollmentDashboardDataResult> {
  const { institutions, programs } = await findAllInstitutionsWithPrograms();

  const data: EnrollmentInstitution[] = institutions.map((institution) => ({
    id: institution.id,
    key: institution.key,
    name: institution.name,
    logoMediaId: institution.logoMediaId,
    programLabel: institution.programLabel,
    programs: programs
      .filter((program) => program.institutionId === institution.id)
      .map((program) => ({
        id: program.id,
        key: program.key,
        label: program.label,
        group: program.groupLabel ?? undefined,
        goal: program.goal,
        renewed: program.renewed,
        newEnrollments: program.newEnrollments,
      })),
  }));

  return { success: true, data };
}
