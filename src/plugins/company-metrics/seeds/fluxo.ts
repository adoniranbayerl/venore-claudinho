import type { OperationResult } from "@/shared/types";
import type { MetricAggregation, MetricDirection, MetricUnit, TargetClassification } from "../contracts/types";
import { listMetricDefinitions } from "../features/definitions/list-metric-definitions/service";
import { listSectors } from "../features/sectors/list-sectors/service";
import { slugify } from "../shared/slugify";
import {
  bulkInsertMetricDefinitions,
  bulkInsertMetricValues,
  bulkInsertSectorGroups,
  bulkInsertSectors,
  bulkInsertTargetInputs,
  bulkInsertTargets,
  bulkInsertTvBoards,
  bulkInsertTvScreens,
} from "./shared/bulk-store";
import { monthlyBuckets, series } from "./shared/history";

// Seed grande — mocka o plugin INTEIRO: 4 setores do funil do aluno (Marketing → Comercial →
// Financeiro → Secretaria), CADA UM com os grupos Colégio Erasto Gaertner e Faculdade Fidelis;
// métricas e metas por grupo; turmas do colégio e cursos da faculdade como metas detalhadas;
// ~11 meses de histórico mensal; e 2 painéis de TV já montados com todas as espécies de tela.
// Idempotente: se "Secretaria" já tem métricas, é no-op. Reaproveita setor vazio de mesmo nome
// (ex: vindo do seed "example").
const SEED_ACTOR_ID = "system-seed";
const YEAR_START = "2026-01-01";
const YEAR_END = "2026-12-31";
const ERASTO_LOGO = "2078515e-4c28-45cd-adf9-d92ed5bd5c34";
const FIDELIS_LOGO = "9da8e513-7cda-424a-b17b-1ffbddfeef92";

const uuid = () => crypto.randomUUID();
const token = () => crypto.randomUUID().replace(/-/g, "");

type DefInput = {
  groupId: string | null;
  label: string;
  unit: MetricUnit;
  aggregation: MetricAggregation;
  direction?: MetricDirection;
  base: number;
  growth: number;
  jitter: number;
};

class Builder {
  sectors: Parameters<typeof bulkInsertSectors>[0] = [];
  groups: Parameters<typeof bulkInsertSectorGroups>[0] = [];
  definitions: Parameters<typeof bulkInsertMetricDefinitions>[0] = [];
  targets: Parameters<typeof bulkInsertTargets>[0] = [];
  targetInputs: Parameters<typeof bulkInsertTargetInputs>[0] = [];
  values: Parameters<typeof bulkInsertMetricValues>[0] = [];
  boards: Parameters<typeof bulkInsertTvBoards>[0] = [];
  screens: Parameters<typeof bulkInsertTvScreens>[0] = [];

  private buckets = monthlyBuckets();
  private usedKeys = new Map<string, Set<string>>(); // scopeKey -> keys
  private counters = new Map<string, number>();

  private nextKey(scope: string, label: string): string {
    const set = this.usedKeys.get(scope) ?? new Set<string>();
    this.usedKeys.set(scope, set);
    const base = slugify(label) || "item";
    let candidate = base;
    let n = 1;
    while (set.has(candidate)) {
      n += 1;
      candidate = `${base}-${n}`;
    }
    set.add(candidate);
    return candidate;
  }

  private nextPos(scope: string): number {
    const current = this.counters.get(scope) ?? 0;
    this.counters.set(scope, current + 1);
    return current;
  }

  sector(input: { id?: string; name: string; description: string; icon: string; isNew: boolean }): string {
    const id = input.id ?? uuid();
    if (input.isNew) {
      this.sectors.push({
        id,
        key: this.nextKey("sectors", input.name),
        name: input.name,
        description: input.description,
        icon: input.icon,
        position: this.nextPos("sectors:pos"),
      });
    }
    return id;
  }

  group(sectorId: string, label: string, logoMediaId: string): string {
    const id = uuid();
    this.groups.push({
      id,
      sectorId,
      key: this.nextKey(`groups:${sectorId}`, label),
      label,
      logoMediaId,
      position: this.nextPos(`groups:pos:${sectorId}`),
    });
    return id;
  }

  definition(sectorId: string, def: DefInput): string {
    const id = uuid();
    this.definitions.push({
      id,
      sectorId,
      groupId: def.groupId,
      key: this.nextKey(`defs:${sectorId}`, def.label),
      label: def.label,
      description: null,
      unit: def.unit,
      aggregation: def.aggregation,
      granularity: "monthly",
      direction: def.direction ?? "up_good",
      position: this.nextPos(`defs:pos:${sectorId}`),
    });
    const round = def.unit !== "percent";
    const points = series({ key: `${sectorId}:${def.label}`, base: def.base, monthlyGrowth: def.growth, jitter: def.jitter, round });
    this.buckets.forEach((periodStart, i) => {
      this.values.push({ definitionId: id, periodStart, value: points[i], enteredByUserId: SEED_ACTOR_ID });
    });
    return id;
  }

  target(input: {
    sectorId: string;
    groupId: string | null;
    label: string;
    value: number;
    inputs: { definitionId: string; weight?: number; as: TargetClassification }[];
  }): string {
    const id = uuid();
    this.targets.push({
      id,
      sectorId: input.sectorId,
      groupId: input.groupId,
      label: input.label,
      description: null,
      targetValue: input.value,
      periodStart: YEAR_START,
      periodEnd: YEAR_END,
      onTrackThreshold: 0.85,
      position: this.nextPos(`targets:pos:${input.sectorId}`),
    });
    input.inputs.forEach((line, i) => {
      this.targetInputs.push({
        targetId: id,
        definitionId: line.definitionId,
        weight: line.weight ?? 1,
        classification: line.as,
        position: i,
      });
    });
    return id;
  }

  board(label: string, screens: Omit<Parameters<typeof bulkInsertTvScreens>[0][number], "id" | "boardId" | "position">[]): void {
    const id = uuid();
    this.boards.push({ id, token: token(), label });
    screens.forEach((screen, i) => this.screens.push({ ...screen, id: uuid(), boardId: id, position: i }));
  }
}

// --- Turmas e cursos ---
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

type GroupCtx = { colegio: string; fidelis: string };

// Cada setor recebe o MESMO conjunto de métricas em duas versões (uma por grupo), com bases
// diferentes pra dar contraste colégio × faculdade.
function buildMarketing(b: Builder, sectorId: string, g: GroupCtx): void {
  for (const [gid, tag, mult] of [
    [g.colegio, "Colégio", 0.72] as const,
    [g.fidelis, "Faculdade", 1] as const,
  ]) {
    const leads = b.definition(sectorId, { groupId: gid, label: `Leads captados — ${tag}`, unit: "count", aggregation: "sum", base: 520 * mult, growth: 0.035, jitter: 0.14 });
    const mql = b.definition(sectorId, { groupId: gid, label: `Leads qualificados (MQL) — ${tag}`, unit: "count", aggregation: "sum", base: 200 * mult, growth: 0.03, jitter: 0.12 });
    b.definition(sectorId, { groupId: gid, label: `Custo por lead — ${tag}`, unit: "currency_brl", aggregation: "average", direction: "down_good", base: 88 - 8 * mult, growth: -0.01, jitter: 0.09 });
    b.definition(sectorId, { groupId: gid, label: `Conversão lead → MQL — ${tag}`, unit: "percent", aggregation: "average", base: 36 + 2 * mult, growth: 0.004, jitter: 0.06 });
    void leads;
    b.target({ sectorId, groupId: gid, label: `MQL 2026 — ${tag}`, value: Math.round(2400 * mult), inputs: [{ definitionId: mql, as: "realized" }] });
  }
}

function buildComercial(b: Builder, sectorId: string, g: GroupCtx): void {
  for (const [gid, tag, mult] of [
    [g.colegio, "Colégio", 0.8] as const,
    [g.fidelis, "Faculdade", 1] as const,
  ]) {
    b.definition(sectorId, { groupId: gid, label: `Oportunidades abertas — ${tag}`, unit: "count", aggregation: "sum", base: 128 * mult, growth: 0.03, jitter: 0.12 });
    b.definition(sectorId, { groupId: gid, label: `Propostas enviadas — ${tag}`, unit: "count", aggregation: "sum", base: 104 * mult, growth: 0.028, jitter: 0.11 });
    const vendas = b.definition(sectorId, { groupId: gid, label: `Matrículas vendidas — ${tag}`, unit: "count", aggregation: "sum", base: 74 * mult, growth: 0.03, jitter: 0.12 });
    b.definition(sectorId, { groupId: gid, label: `Ticket médio — ${tag}`, unit: "currency_brl", aggregation: "average", base: 1380 * (tag === "Colégio" ? 0.71 : 1), growth: 0.006, jitter: 0.05 });
    b.target({ sectorId, groupId: gid, label: `Vendas 2026 — ${tag}`, value: Math.round(760 * mult), inputs: [{ definitionId: vendas, as: "realized" }] });
  }
}

function buildFinanceiro(b: Builder, sectorId: string, g: GroupCtx): void {
  for (const [gid, tag, mult] of [
    [g.colegio, "Colégio", 0.62] as const,
    [g.fidelis, "Faculdade", 1] as const,
  ]) {
    b.definition(sectorId, { groupId: gid, label: `Boletos emitidos — ${tag}`, unit: "count", aggregation: "sum", base: 78 * mult, growth: 0.028, jitter: 0.1 });
    const pagos = b.definition(sectorId, { groupId: gid, label: `Pagamentos confirmados — ${tag}`, unit: "count", aggregation: "sum", base: 66 * mult, growth: 0.03, jitter: 0.11 });
    const receita = b.definition(sectorId, { groupId: gid, label: `Receita reconhecida — ${tag}`, unit: "currency_brl", aggregation: "sum", base: 520000 * mult, growth: 0.03, jitter: 0.12 });
    b.definition(sectorId, { groupId: gid, label: `Inadimplência — ${tag}`, unit: "percent", aggregation: "average", direction: "down_good", base: 12.5 - 3 * mult, growth: -0.01, jitter: 0.08 });
    void pagos;
    b.target({ sectorId, groupId: gid, label: `Receita 2026 — ${tag}`, value: Math.round(6500000 * mult), inputs: [{ definitionId: receita, as: "realized" }] });
  }
}

function buildSecretaria(b: Builder, sectorId: string, g: GroupCtx): { spotlightColegio: string; spotlightFidelis: string; firstTurmaTarget: string } {
  const spotlight: Record<string, string> = {};
  let firstTurmaTarget = "";

  const groups = [
    { gid: g.colegio, tag: "Colégio", mult: 0.62, items: ERASTO_TURMAS, kind: "turma" },
    { gid: g.fidelis, tag: "Faculdade", mult: 1, items: FIDELIS_CURSOS, kind: "curso" },
  ] as const;

  for (const grp of groups) {
    b.definition(sectorId, { groupId: grp.gid, label: `Documentos pendentes — ${grp.tag}`, unit: "count", aggregation: "last", direction: "down_good", base: 28 * grp.mult, growth: -0.02, jitter: 0.16 });
    b.definition(sectorId, { groupId: grp.gid, label: `Contratos assinados — ${grp.tag}`, unit: "count", aggregation: "sum", base: 62 * grp.mult, growth: 0.03, jitter: 0.11 });
    const remat = b.definition(sectorId, { groupId: grp.gid, label: `Rematrículas — ${grp.tag}`, unit: "count", aggregation: "last", base: 470 * grp.mult, growth: 0.02, jitter: 0.07 });
    const novas = b.definition(sectorId, { groupId: grp.gid, label: `Novas matrículas — ${grp.tag}`, unit: "count", aggregation: "last", base: 236 * grp.mult, growth: 0.03, jitter: 0.1 });
    const efet = b.definition(sectorId, { groupId: grp.gid, label: `Matrículas efetivadas — ${grp.tag}`, unit: "count", aggregation: "sum", base: 62 * grp.mult, growth: 0.03, jitter: 0.11 });
    spotlight[grp.tag] = efet;

    b.target({
      sectorId,
      groupId: grp.gid,
      label: `Matrículas 2026 — ${grp.tag}`,
      value: grp.items.reduce((sum, item) => sum + item.goal, 0),
      inputs: [
        { definitionId: remat, as: "realized" },
        { definitionId: novas, as: "realized" },
      ],
    });

    for (const item of grp.items) {
      const def = b.definition(sectorId, { groupId: grp.gid, label: `Matriculados — ${item.label}`, unit: "count", aggregation: "last", base: item.base, growth: 0.03, jitter: 0.08 });
      const targetId = b.target({ sectorId, groupId: grp.gid, label: `${item.label} (${grp.tag})`, value: item.goal, inputs: [{ definitionId: def, as: "realized" }] });
      if (!firstTurmaTarget) firstTurmaTarget = targetId;
    }
  }

  return { spotlightColegio: spotlight.Colégio, spotlightFidelis: spotlight.Faculdade, firstTurmaTarget };
}

export async function seedCompanyMetricsFluxo(): Promise<OperationResult<void>> {
  const existing = await listSectors({ includeArchived: true });
  if (!existing.success) return { success: false, error: existing.error };
  const idByName = new Map(existing.data.map((s) => [s.name.toLowerCase(), s.id]));

  // Já semeado? (Secretaria com métricas)
  const secretariaId = idByName.get("secretaria");
  if (secretariaId) {
    const defs = await listMetricDefinitions({ sectorId: secretariaId, includeArchived: true });
    if (defs.success && defs.data.length > 0) return { success: true, data: undefined };
  }

  const b = new Builder();

  const specs = [
    { name: "Marketing", description: "Topo do funil: alcance, geração e qualificação de leads por instituição.", icon: "megaphone", build: buildMarketing },
    { name: "Comercial", description: "Meio do funil: oportunidades, propostas e matrículas vendidas por instituição.", icon: "trending-up", build: buildComercial },
    { name: "Financeiro", description: "Cobrança, confirmação de pagamento e receita por instituição.", icon: "wallet", build: buildFinanceiro },
  ] as const;

  const sectorIds: Record<string, string> = {};

  for (const spec of specs) {
    const existingId = idByName.get(spec.name.toLowerCase());
    const id = b.sector({ id: existingId, name: spec.name, description: spec.description, icon: spec.icon, isNew: !existingId });
    sectorIds[spec.name] = id;
    const g: GroupCtx = {
      colegio: b.group(id, "Colégio Erasto Gaertner", ERASTO_LOGO),
      fidelis: b.group(id, "Faculdade Fidelis", FIDELIS_LOGO),
    };
    spec.build(b, id, g);
  }

  const secId = b.sector({
    id: secretariaId,
    name: "Secretaria",
    description: "Fim do funil: documentação, contratos e matrícula efetivada por instituição, turma e curso.",
    icon: "clipboard-list",
    isNew: !secretariaId,
  });
  sectorIds.Secretaria = secId;
  const secGroups: GroupCtx = {
    colegio: b.group(secId, "Colégio Erasto Gaertner", ERASTO_LOGO),
    fidelis: b.group(secId, "Faculdade Fidelis", FIDELIS_LOGO),
  };
  const { spotlightColegio, spotlightFidelis, firstTurmaTarget } = buildSecretaria(b, secId, secGroups);

  // --- Painéis de TV (mocka as telas também) ---
  b.board("Painel geral", [
    { kind: "overview", sectorId: null, targetId: null, definitionId: null, dwellSeconds: 18 },
    { kind: "sector_targets", sectorId: sectorIds.Marketing, targetId: null, definitionId: null, dwellSeconds: 18 },
    { kind: "sector_targets", sectorId: sectorIds.Comercial, targetId: null, definitionId: null, dwellSeconds: 18 },
    { kind: "sector_targets", sectorId: sectorIds.Financeiro, targetId: null, definitionId: null, dwellSeconds: 18 },
    { kind: "group_summary", sectorId: sectorIds.Secretaria, targetId: null, definitionId: null, dwellSeconds: 24 },
  ]);
  b.board("Recepção — matrículas", [
    { kind: "group_summary", sectorId: sectorIds.Secretaria, targetId: null, definitionId: null, dwellSeconds: 24 },
    { kind: "sector_targets", sectorId: sectorIds.Secretaria, targetId: null, definitionId: null, dwellSeconds: 20 },
    { kind: "metric_spotlight", sectorId: null, targetId: null, definitionId: spotlightColegio, dwellSeconds: 15 },
    { kind: "metric_spotlight", sectorId: null, targetId: null, definitionId: spotlightFidelis, dwellSeconds: 15 },
    { kind: "target_board", sectorId: null, targetId: firstTurmaTarget, definitionId: null, dwellSeconds: 15 },
  ]);

  // --- Grava tudo (poucas queries, em ordem de dependência) ---
  await bulkInsertSectors(b.sectors);
  await bulkInsertSectorGroups(b.groups);
  await bulkInsertMetricDefinitions(b.definitions);
  await bulkInsertTargets(b.targets);
  await bulkInsertTargetInputs(b.targetInputs);
  await bulkInsertMetricValues(b.values);
  await bulkInsertTvBoards(b.boards);
  await bulkInsertTvScreens(b.screens);

  return { success: true, data: undefined };
}
