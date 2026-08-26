import { getEnrollmentDashboardData } from "@/plugins/enrollment-dashboard";
import { createInstitution } from "@/plugins/enrollment-dashboard/features/institutions/create-institution/service";
import { createProgram } from "@/plugins/enrollment-dashboard/features/programs/create-program/service";
import { getSeedEnrollmentDashboardData } from "@/plugins/enrollment-dashboard/shared/mock-data";

// Script one-shot (mesmo espírito de scripts/bootstrap-superadmin.ts): popula o dashboard com o
// conteúdo que antes vivia hardcoded em mock-data.ts, agora só usado aqui como seed inicial —
// depois da primeira execução, os dados reais são editados via /admin/enrollment-dashboard, nunca
// mais por este script. Chama service.ts direto (não o handler via barrel), porque não existe
// sessão/ator autenticado num script CLI — mesmo racional de por que grant-superadmin/handler.ts
// não tem authorizeActor. actorId aqui é só o rótulo de auditoria de beginOperation, não vira
// coluna em nenhuma tabela (schema/index.ts não guarda "criado por" pra institutions/programs).
const SEED_ACTOR_ID = "system-seed";

async function main() {
  const existing = await getEnrollmentDashboardData();
  if (!existing.success) {
    console.error(`Não foi possível ler o dashboard atual: ${existing.error.message}`);
    process.exit(1);
  }
  const existingNames = new Set(existing.data.map((institution) => institution.name));

  for (const seedInstitution of getSeedEnrollmentDashboardData()) {
    if (existingNames.has(seedInstitution.name)) {
      console.log(`Instituição "${seedInstitution.name}" já existe — pulando.`);
      continue;
    }

    const institutionResult = await createInstitution({
      name: seedInstitution.name,
      programLabel: seedInstitution.programLabel,
      logoMediaId: seedInstitution.logoMediaId,
      actorId: SEED_ACTOR_ID,
    });
    if (!institutionResult.success) {
      console.error(`Falha ao criar "${seedInstitution.name}": ${institutionResult.error.message}`);
      continue;
    }

    let createdPrograms = 0;
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
        console.error(`Falha ao criar "${program.label}" em "${seedInstitution.name}": ${programResult.error.message}`);
        continue;
      }
      createdPrograms += 1;
    }

    console.log(`Instituição "${seedInstitution.name}" criada com ${createdPrograms} turma(s)/curso(s).`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
