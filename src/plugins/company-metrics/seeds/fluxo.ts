import type { OperationResult } from "@/shared/types";
import type {
  MetricAggregation,
  MetricDirection,
  MetricUnit,
  TargetClassification,
} from "../contracts/types";
import { createMetricDefinition } from "../features/definitions/create-metric-definition/service";
import { listMetricDefinitions } from "../features/definitions/list-metric-definitions/service";
import { createSector } from "../features/sectors/create-sector/service";
import { createSectorGroup } from "../features/groups/create-sector-group/service";
import { createTarget } from "../features/targets/create-target/service";
import { listSectors } from "../features/sectors/list-sectors/service";
import { bulkInsertMetricValues } from "./shared/bulk-store";
import { monthlyBuckets, series } from "./shared/history";

// Seed grande cobrindo TODO o fluxo do aluno: lead (Marketing) → venda (Comercial) → pagamento
// (Financeiro) → matrícula (Secretaria, por instituição/turma/curso). Gera ~11 meses de histórico
// mensal por métrica, então os gráficos de tendência e as telas de TV têm o que mostrar.
// Idempotente: pula setor já existente pelo nome.
const SEED_ACTOR_ID = "system-seed";

const ERASTO_LOGO_MEDIA_ID = "2078515e-4c28-45cd-adf9-d92ed5bd5c34";
const FIDELIS_LOGO_MEDIA_ID = "9da8e513-7cda-424a-b17b-1ffbddfeef92";

type DefSpec = {
  label: string;
  unit: MetricUnit;
  aggregation: MetricAggregation;
  direction?: MetricDirection;
  base: number;
  growth: number;
  jitter: number;
};

type TargetSpec = {
  label: string;
  value: number;
  inputs: { def: string; weight?: number; as: TargetClassification }[];
};

type GroupSpec = { label: string; logoMediaId: string; defs: DefSpec[]; targets: TargetSpec[] };

type SectorSpec = {
  name: string;
  icon: string;
  description: string;
  defs: DefSpec[];
  targets: TargetSpec[];
  groups?: GroupSpec[];
};

const YEAR_START = "2026-01-01";
const YEAR_END = "2026-12-31";

// --- Turmas do colégio e cursos da faculdade ---
const ERASTO_TURMAS: { label: string; goal: number; base: number }[] = [
  { label: "Nível II", goal: 24, base: 15 },
  { label: "Nível III", goal: 26, base: 17 },
  { label: "Nível IV", goal: 28, base: 19 },
  { label: "Nível V", goal: 28, base: 20 },
  { label: "1º ano", goal: 30, base: 21 },
  { label: "2º ano", goal: 30, base: 22 },
  { label: "3º ano", goal: 32, base: 24 },
  { label: "4º ano", goal: 32, base: 25 },
  { label: "5º ano", goal: 34, base: 27 },
  { label: "6º ano", goal: 36, base: 27 },
  { label: "7º ano", goal: 36, base: 26 },
  { label: "8º ano", goal: 34, base: 24 },
  { label: "9º ano", goal: 34, base: 23 },
  { label: "1ª série EM", goal: 38, base: 24 },
  { label: "2ª série EM", goal: 36, base: 25 },
  { label: "3ª série EM", goal: 34, base: 22 },
];

const FIDELIS_CURSOS: { label: string; goal: number; base: number }[] = [
  { label: "Psicologia", goal: 180, base: 120 },
  { label: "Pedagogia", goal: 140, base: 96 },
  { label: "Teologia", goal: 90, base: 58 },
  { label: "Teologia EAD", goal: 240, base: 150 },
  { label: "Administração", goal: 160, base: 104 },
  { label: "Direito", goal: 200, base: 128 },
];

function turmaDefs(items: { label: string; base: number }[]): DefSpec[] {
  return items.map((item) => ({
    label: `Matriculados — ${item.label}`,
    unit: "count" as const,
    aggregation: "last" as const,
    direction: "up_good" as const,
    base: item.base,
    growth: 0.03,
    jitter: 0.08,
  }));
}

function turmaTargets(items: { label: string; goal: number }[]): TargetSpec[] {
  return items.map((item) => ({
    label: item.label,
    value: item.goal,
    inputs: [{ def: `Matriculados — ${item.label}`, as: "realized" }],
  }));
}

const SECTORS: SectorSpec[] = [
  {
    name: "Marketing",
    icon: "megaphone",
    description: "Topo do funil: alcance, geração e qualificação de leads.",
    defs: [
      { label: "Alcance das campanhas", unit: "count", aggregation: "sum", base: 42000, growth: 0.04, jitter: 0.18 },
      { label: "Leads captados", unit: "count", aggregation: "sum", base: 820, growth: 0.035, jitter: 0.14 },
      { label: "Leads qualificados (MQL)", unit: "count", aggregation: "sum", base: 300, growth: 0.03, jitter: 0.12 },
      { label: "Investimento em mídia", unit: "currency_brl", aggregation: "sum", base: 68000, growth: 0.02, jitter: 0.1 },
      { label: "Custo por lead", unit: "currency_brl", aggregation: "average", direction: "down_good", base: 83, growth: -0.01, jitter: 0.09 },
      { label: "Conversão lead → MQL", unit: "percent", aggregation: "average", base: 36, growth: 0.004, jitter: 0.06 },
    ],
    targets: [
      { label: "Leads qualificados 2026", value: 3600, inputs: [{ def: "Leads qualificados (MQL)", as: "realized" }] },
    ],
  },
  {
    name: "Comercial",
    icon: "trending-up",
    description: "Meio do funil: oportunidades, propostas e matrículas vendidas.",
    defs: [
      { label: "Oportunidades abertas", unit: "count", aggregation: "sum", base: 224, growth: 0.03, jitter: 0.12 },
      { label: "Propostas enviadas", unit: "count", aggregation: "sum", base: 182, growth: 0.028, jitter: 0.11 },
      { label: "Matrículas vendidas", unit: "count", aggregation: "sum", base: 132, growth: 0.03, jitter: 0.12 },
      { label: "Ticket médio", unit: "currency_brl", aggregation: "average", base: 1180, growth: 0.006, jitter: 0.05 },
      { label: "Conversão MQL → venda", unit: "percent", aggregation: "average", base: 44, growth: 0.003, jitter: 0.06 },
      { label: "Ciclo de venda (dias)", unit: "days", aggregation: "average", direction: "down_good", base: 19, growth: -0.008, jitter: 0.1 },
    ],
    targets: [{ label: "Vendas 2026", value: 1300, inputs: [{ def: "Matrículas vendidas", as: "realized" }] }],
  },
  {
    name: "Financeiro",
    icon: "wallet",
    description: "Cobrança, confirmação de pagamento e receita reconhecida.",
    defs: [
      { label: "Boletos emitidos", unit: "count", aggregation: "sum", base: 138, growth: 0.028, jitter: 0.1 },
      { label: "Pagamentos confirmados", unit: "count", aggregation: "sum", base: 118, growth: 0.03, jitter: 0.11 },
      { label: "Receita reconhecida", unit: "currency_brl", aggregation: "sum", base: 690000, growth: 0.03, jitter: 0.12 },
      { label: "Inadimplência", unit: "percent", aggregation: "average", direction: "down_good", base: 11.5, growth: -0.01, jitter: 0.08 },
      { label: "Descontos concedidos", unit: "currency_brl", aggregation: "sum", direction: "down_good", base: 42000, growth: 0.01, jitter: 0.12 },
      { label: "Ticket médio recebido", unit: "currency_brl", aggregation: "average", base: 1090, growth: 0.005, jitter: 0.05 },
    ],
    targets: [
      { label: "Receita 2026", value: 9000000, inputs: [{ def: "Receita reconhecida", as: "realized" }] },
      { label: "Pagamentos confirmados 2026", value: 1200, inputs: [{ def: "Pagamentos confirmados", as: "realized" }] },
    ],
  },
  {
    name: "Secretaria",
    icon: "clipboard-list",
    description: "Fim do funil: documentação, contratos e matrícula efetivada por instituição.",
    defs: [
      { label: "Documentos pendentes", unit: "count", aggregation: "last", direction: "down_good", base: 46, growth: -0.02, jitter: 0.16 },
      { label: "Contratos assinados", unit: "count", aggregation: "sum", base: 112, growth: 0.03, jitter: 0.11 },
      { label: "Matrículas efetivadas", unit: "count", aggregation: "sum", base: 110, growth: 0.03, jitter: 0.11 },
    ],
    targets: [
      { label: "Matrículas efetivadas 2026", value: 1250, inputs: [{ def: "Matrículas efetivadas", as: "realized" }] },
    ],
    groups: [
      {
        label: "Colégio Erasto Gaertner",
        logoMediaId: ERASTO_LOGO_MEDIA_ID,
        defs: [
          { label: "Rematrículas — Erasto", unit: "count", aggregation: "last", direction: "up_good", base: 300, growth: 0.02, jitter: 0.07 },
          { label: "Novas matrículas — Erasto", unit: "count", aggregation: "last", direction: "up_good", base: 96, growth: 0.03, jitter: 0.1 },
          ...turmaDefs(ERASTO_TURMAS),
        ],
        targets: [
          {
            label: "Matrículas Erasto Gaertner 2026",
            value: ERASTO_TURMAS.reduce((sum, turma) => sum + turma.goal, 0),
            inputs: [
              { def: "Rematrículas — Erasto", as: "realized" },
              { def: "Novas matrículas — Erasto", as: "realized" },
            ],
          },
          ...turmaTargets(ERASTO_TURMAS),
        ],
      },
      {
        label: "Faculdade Fidelis",
        logoMediaId: FIDELIS_LOGO_MEDIA_ID,
        defs: [
          { label: "Rematrículas — Fidelis", unit: "count", aggregation: "last", direction: "up_good", base: 470, growth: 0.02, jitter: 0.07 },
          { label: "Novas matrículas — Fidelis", unit: "count", aggregation: "last", direction: "up_good", base: 236, growth: 0.03, jitter: 0.1 },
          ...turmaDefs(FIDELIS_CURSOS),
        ],
        targets: [
          {
            label: "Matrículas Faculdade Fidelis 2026",
            value: FIDELIS_CURSOS.reduce((sum, curso) => sum + curso.goal, 0),
            inputs: [
              { def: "Rematrículas — Fidelis", as: "realized" },
              { def: "Novas matrículas — Fidelis", as: "realized" },
            ],
          },
          ...turmaTargets(FIDELIS_CURSOS),
        ],
      },
    ],
  },
];

async function seedDefsAndValues(
  sectorId: string,
  groupId: string | null,
  defs: DefSpec[],
  buckets: string[],
  valueRows: { definitionId: string; periodStart: string; value: number; enteredByUserId: string }[],
): Promise<OperationResult<Map<string, string>>> {
  const idByLabel = new Map<string, string>();
  for (const spec of defs) {
    const created = await createMetricDefinition({
      sectorId,
      groupId,
      label: spec.label,
      unit: spec.unit,
      aggregation: spec.aggregation,
      granularity: "monthly",
      direction: spec.direction ?? "up_good",
      actorId: SEED_ACTOR_ID,
    });
    if (!created.success) return { success: false, error: created.error };
    idByLabel.set(spec.label, created.data.id);

    const points = series({
      key: `${sectorId}:${spec.label}`,
      base: spec.base,
      monthlyGrowth: spec.growth,
      jitter: spec.jitter,
      round: spec.unit !== "percent" && spec.unit !== "currency_brl" ? true : spec.unit === "currency_brl",
      months: buckets.length,
    });
    buckets.forEach((periodStart, index) => {
      valueRows.push({ definitionId: created.data.id, periodStart, value: points[index], enteredByUserId: SEED_ACTOR_ID });
    });
  }
  return { success: true, data: idByLabel };
}

async function seedTargets(
  sectorId: string,
  groupId: string | null,
  targets: TargetSpec[],
  defIds: Map<string, string>,
): Promise<OperationResult<void>> {
  for (const spec of targets) {
    const inputs = spec.inputs.map((input) => ({
      definitionId: defIds.get(input.def) ?? "",
      weight: input.weight ?? 1,
      classification: input.as,
    }));
    if (inputs.some((input) => input.definitionId === "")) {
      return { success: false, error: { code: "company-metrics.seed.fluxo.bad_target_input", message: `Meta "${spec.label}" referencia métrica inexistente.` } };
    }
    const created = await createTarget({
      sectorId,
      groupId,
      label: spec.label,
      targetValue: spec.value,
      periodStart: YEAR_START,
      periodEnd: YEAR_END,
      inputs,
      actorId: SEED_ACTOR_ID,
    });
    if (!created.success) return { success: false, error: created.error };
  }
  return { success: true, data: undefined };
}

export async function seedCompanyMetricsFluxo(): Promise<OperationResult<void>> {
  const existing = await listSectors({ includeArchived: true });
  if (!existing.success) return { success: false, error: existing.error };
  const existingByName = new Map(existing.data.map((sector) => [sector.name.toLowerCase(), sector.id]));

  const buckets = monthlyBuckets();

  for (const spec of SECTORS) {
    // Reaproveita um setor de mesmo nome se ele existir e estiver VAZIO (ex: veio do seed
    // "example"); pula se já tem métricas; cria do zero se não existe.
    let sectorId = existingByName.get(spec.name.toLowerCase()) ?? null;
    if (sectorId) {
      const defs = await listMetricDefinitions({ sectorId, includeArchived: true });
      if (defs.success && defs.data.length > 0) continue;
    } else {
      const sector = await createSector({
        name: spec.name,
        description: spec.description,
        icon: spec.icon,
        actorId: SEED_ACTOR_ID,
      });
      if (!sector.success) return { success: false, error: sector.error };
      sectorId = sector.data.id;
    }

    const valueRows: { definitionId: string; periodStart: string; value: number; enteredByUserId: string }[] = [];

    const sectorDefIds = await seedDefsAndValues(sectorId, null, spec.defs, buckets, valueRows);
    if (!sectorDefIds.success) return { success: false, error: sectorDefIds.error };

    const allDefIds = new Map(sectorDefIds.data);

    for (const group of spec.groups ?? []) {
      const createdGroup = await createSectorGroup({
        sectorId,
        label: group.label,
        logoMediaId: group.logoMediaId,
        actorId: SEED_ACTOR_ID,
      });
      if (!createdGroup.success) return { success: false, error: createdGroup.error };

      const groupDefIds = await seedDefsAndValues(sectorId, createdGroup.data.id, group.defs, buckets, valueRows);
      if (!groupDefIds.success) return { success: false, error: groupDefIds.error };
      for (const [label, id] of groupDefIds.data) allDefIds.set(label, id);

      const groupTargets = await seedTargets(sectorId, createdGroup.data.id, group.targets, groupDefIds.data);
      if (!groupTargets.success) return { success: false, error: groupTargets.error };
    }

    const sectorTargets = await seedTargets(sectorId, null, spec.targets, allDefIds);
    if (!sectorTargets.success) return { success: false, error: sectorTargets.error };

    await bulkInsertMetricValues(valueRows);
  }

  return { success: true, data: undefined };
}
