import type { OperationResult } from "@/shared/types";
import { createMetricDefinition } from "../features/definitions/create-metric-definition/service";
import { createSector } from "../features/sectors/create-sector/service";
import { createSectorGroup } from "../features/groups/create-sector-group/service";
import { createTarget } from "../features/targets/create-target/service";
import { upsertMetricValueForPeriod } from "../features/values/upsert-metric-value/service";
import { listSectors } from "../features/sectors/list-sectors/service";
import { listSectorGroups } from "../features/groups/list-sector-groups/service";
import { currentBucket } from "../shared/period";
import { DEFAULT_COMPANY_METRICS_TIMEZONE } from "../shared/settings";

// Seed de PARIDADE com o antigo plugin enrollment-dashboard (docs/metricas-internas-plugin.md
// §9.1): o caso "matrícula" (Colégio Erasto Gaertner + Faculdade Fidelis) expresso no modelo
// geral. Instituição → sector_group; meta de matrícula da instituição → target (valor = soma das
// metas das turmas); rematrícula/nova matrícula → duas definições, ambas input "realized" da
// composição. Idempotente: pula instituição já semeada.
const SEED_ACTOR_ID = "system-seed";
const SECTOR_NAME = "Matrículas";

const ERASTO_LOGO_MEDIA_ID = "2078515e-4c28-45cd-adf9-d92ed5bd5c34";
const FIDELIS_LOGO_MEDIA_ID = "9da8e513-7cda-424a-b17b-1ffbddfeef92";

type SeedInstitution = {
  name: string;
  logoMediaId: string;
  goal: number;
  renewed: number;
  newEnrollments: number;
};

const INSTITUTIONS: SeedInstitution[] = [
  // Erasto: soma das 16 turmas (Nível II ao 3º EM).
  { name: "Colégio Erasto Gaertner", logoMediaId: ERASTO_LOGO_MEDIA_ID, goal: 522, renewed: 368, newEnrollments: 107 },
  // Fidelis: soma dos 4 cursos.
  { name: "Faculdade Fidelis", logoMediaId: FIDELIS_LOGO_MEDIA_ID, goal: 630, renewed: 370, newEnrollments: 235 },
];

async function ensureSector(): Promise<OperationResult<{ id: string }>> {
  const existing = await listSectors({ includeArchived: true });
  if (!existing.success) return { success: false, error: existing.error };
  const found = existing.data.find((sector) => sector.name.toLowerCase() === SECTOR_NAME.toLowerCase());
  if (found) return { success: true, data: { id: found.id } };

  const created = await createSector({
    name: SECTOR_NAME,
    description: "Meta de matrícula por instituição — rematrícula e novas matrículas.",
    icon: "graduation-cap",
    actorId: SEED_ACTOR_ID,
  });
  if (!created.success) return { success: false, error: created.error };
  return { success: true, data: { id: created.data.id } };
}

export async function seedCompanyMetricsMatricula(): Promise<OperationResult<void>> {
  const sector = await ensureSector();
  if (!sector.success) return { success: false, error: sector.error };
  const sectorId = sector.data.id;

  const groupsResult = await listSectorGroups({ sectorId });
  if (!groupsResult.success) return { success: false, error: groupsResult.error };
  const existingGroupLabels = new Set(groupsResult.data.map((group) => group.label.toLowerCase()));

  const period = currentBucket("monthly", DEFAULT_COMPANY_METRICS_TIMEZONE);

  for (const institution of INSTITUTIONS) {
    if (existingGroupLabels.has(institution.name.toLowerCase())) continue;

    const group = await createSectorGroup({
      sectorId,
      label: institution.name,
      logoMediaId: institution.logoMediaId,
      actorId: SEED_ACTOR_ID,
    });
    if (!group.success) return { success: false, error: group.error };

    const renewedDef = await createMetricDefinition({
      sectorId,
      groupId: group.data.id,
      label: `Rematriculados — ${institution.name}`,
      unit: "count",
      aggregation: "last",
      granularity: "monthly",
      direction: "up_good",
      actorId: SEED_ACTOR_ID,
    });
    if (!renewedDef.success) return { success: false, error: renewedDef.error };

    const newDef = await createMetricDefinition({
      sectorId,
      groupId: group.data.id,
      label: `Novas matrículas — ${institution.name}`,
      unit: "count",
      aggregation: "last",
      granularity: "monthly",
      direction: "up_good",
      actorId: SEED_ACTOR_ID,
    });
    if (!newDef.success) return { success: false, error: newDef.error };

    const target = await createTarget({
      sectorId,
      groupId: group.data.id,
      label: `${institution.name} — matrículas 2026`,
      targetValue: institution.goal,
      periodStart: "2026-01-01",
      periodEnd: "2026-12-31",
      inputs: [
        { definitionId: renewedDef.data.id, weight: 1, classification: "realized" },
        { definitionId: newDef.data.id, weight: 1, classification: "realized" },
      ],
      actorId: SEED_ACTOR_ID,
    });
    if (!target.success) return { success: false, error: target.error };

    const renewedValue = await upsertMetricValueForPeriod({
      definitionId: renewedDef.data.id,
      periodDate: period,
      value: institution.renewed,
      actorId: SEED_ACTOR_ID,
    });
    if (!renewedValue.success) return { success: false, error: renewedValue.error };

    const newValue = await upsertMetricValueForPeriod({
      definitionId: newDef.data.id,
      periodDate: period,
      value: institution.newEnrollments,
      actorId: SEED_ACTOR_ID,
    });
    if (!newValue.success) return { success: false, error: newValue.error };
  }

  return { success: true, data: undefined };
}
