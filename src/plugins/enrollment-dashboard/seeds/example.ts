import type { OperationResult } from "@/shared/types";
import { getEnrollmentDashboardData } from "../features/get-enrollment-dashboard-data/service";
import { createInstitution } from "../features/institutions/create-institution/service";
import { createProgram } from "../features/programs/create-program/service";
import { getSeedEnrollmentDashboardData } from "../shared/mock-data";

// Seed de dados de exemplo do plugin (platform/plugin-engine/plugin-seed-registry.ts). O conteúdo
// (Colégio Erasto Gaertner + Faculdade Fidelis) vive em shared/mock-data.ts; antes só era
// aplicado por scripts/seed-enrollment-dashboard.ts, que agora é um wrapper fino em cima desta
// função. Chama service.ts direto: sem sessão/ator neste caminho. actorId é só rótulo de
// auditoria de beginOperation, não vira coluna.
const SEED_ACTOR_ID = "system-seed";

// Idempotente: pula instituição já existente pelo nome — rodar 2x não duplica.
export async function seedEnrollmentDashboardExample(): Promise<OperationResult<void>> {
  const existing = await getEnrollmentDashboardData();
  if (!existing.success) {
    return { success: false, error: existing.error };
  }
  const existingNames = new Set(existing.data.map((institution) => institution.name));

  for (const seedInstitution of getSeedEnrollmentDashboardData()) {
    if (existingNames.has(seedInstitution.name)) continue;

    const institutionResult = await createInstitution({
      name: seedInstitution.name,
      programLabel: seedInstitution.programLabel,
      logoMediaId: seedInstitution.logoMediaId,
      actorId: SEED_ACTOR_ID,
    });
    if (!institutionResult.success) {
      return { success: false, error: institutionResult.error };
    }

    for (const program of seedInstitution.programs) {
      const programResult = await createProgram({
        institutionId: institutionResult.data.id,
        label: program.label,
        groupLabel: program.group,
        goal: program.goal,
        renewed: program.renewed,
        newEnrollments: program.newEnrollments,
        actorId: SEED_ACTOR_ID,
      });
      if (!programResult.success) {
        return { success: false, error: programResult.error };
      }
    }
  }

  return { success: true, data: undefined };
}
