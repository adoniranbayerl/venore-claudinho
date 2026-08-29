// Superfície pública do plugin (barrel index.ts + contracts/) — o que outros plugins/temas/
// platform podem importar. Nada de store/service interno aqui.

export const SECTOR_MEMBER_ROLES = ["admin", "editor", "viewer"] as const;
export type SectorMemberRole = (typeof SECTOR_MEMBER_ROLES)[number];

// Um setor da empresa (comercial, financeiro, marketing… depois RH, secretaria, almoxarifado,
// pedagógico). `key` é slug gerado do nome na criação, nunca digitado nem reeditável — vira parte
// de URL (telas de TV) e identificador estável entre reordenações.
export type SectorRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  position: number;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Agrupamento opcional dentro de um setor, com rótulo/logo/ordem próprios. Absorve "instituição"
// do antigo enrollment-dashboard e serve genérico ("Regional Sul", "Matriz/Filial"). `key` é slug
// gerado, único por setor.
export type SectorGroupRecord = {
  id: string;
  sectorId: string;
  key: string;
  label: string;
  logoMediaId: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

// --- Fase 2: definições de métrica e valores ---

export const METRIC_UNITS = ["count", "currency_brl", "percent", "days"] as const;
export type MetricUnit = (typeof METRIC_UNITS)[number];

export const METRIC_AGGREGATIONS = ["sum", "last", "average"] as const;
export type MetricAggregation = (typeof METRIC_AGGREGATIONS)[number];

export const METRIC_DEFINITION_GRANULARITIES = ["daily", "weekly", "monthly"] as const;
export type MetricDefinitionGranularity = (typeof METRIC_DEFINITION_GRANULARITIES)[number];

export const METRIC_DIRECTIONS = ["up_good", "down_good"] as const;
export type MetricDirection = (typeof METRIC_DIRECTIONS)[number];

export type MetricDefinitionRecord = {
  id: string;
  sectorId: string;
  groupId: string | null;
  key: string;
  label: string;
  description: string | null;
  unit: MetricUnit;
  aggregation: MetricAggregation;
  granularity: MetricDefinitionGranularity;
  direction: MetricDirection;
  position: number;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// periodStart é sempre um início de bucket "YYYY-MM-DD" normalizado à granularity da definição.
export type MetricValueRecord = {
  id: string;
  definitionId: string;
  periodStart: string;
  value: number;
  note: string | null;
  enteredByUserId: string | null;
  enteredAt: Date;
  updatedAt: Date;
};

// --- Fase 3: metas e composição ---

export const TARGET_CLASSIFICATIONS = ["realized", "at_risk", "projected", "subtract"] as const;
export type TargetClassification = (typeof TARGET_CLASSIFICATIONS)[number];

export type TargetRecord = {
  id: string;
  sectorId: string;
  groupId: string | null;
  label: string;
  description: string | null;
  targetValue: number;
  periodStart: string;
  periodEnd: string;
  onTrackThreshold: number;
  position: number;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TargetInputRecord = {
  targetId: string;
  definitionId: string;
  weight: number;
  classification: TargetClassification;
  position: number;
};

export type TargetWithInputs = { target: TargetRecord; inputs: TargetInputRecord[] };

// Resultado do cálculo de uma meta (§2.2). Reusado pela visualização interativa e pela TV.
export type TargetRollupStatus = "met" | "on_track" | "below";

export type TargetRollupLine = {
  definitionId: string;
  label: string;
  classification: TargetClassification;
  weight: number;
  // Valor consolidado da definição no período da meta.
  resolvedValue: number;
};

export type TargetRollup = {
  targetValue: number;
  realized: number;
  atRisk: number;
  projected: number;
  subtract: number;
  headline: number;
  optimistic: number;
  gap: number;
  completion: number;
  optimisticCompletion: number;
  status: TargetRollupStatus;
};

export type TargetRollupView = {
  target: TargetRecord;
  lines: TargetRollupLine[];
  rollup: TargetRollup;
};

// --- Fase 5: telas de TV ---

export const TV_SCREEN_KINDS = [
  "overview",
  "sector_kpis",
  "target_board",
  "sector_targets",
  "group_summary",
  "metric_spotlight",
] as const;
export type TvScreenKind = (typeof TV_SCREEN_KINDS)[number];

export type TvBoardRecord = {
  id: string;
  token: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TvScreenRecord = {
  id: string;
  boardId: string;
  kind: TvScreenKind;
  sectorId: string | null;
  targetId: string | null;
  definitionId: string | null;
  dwellSeconds: number;
  position: number;
};

export type TvBoardWithScreens = { board: TvBoardRecord; screens: TvScreenRecord[] };

export type SectorOverviewLite = {
  name: string;
  targetCount: number;
  statusCounts: Record<TargetRollupStatus, number>;
  averageCompletion: number | null;
};

export type TargetBoardLite = {
  label: string;
  unit: MetricUnit;
  periodStart: string;
  periodEnd: string;
  rollup: TargetRollup;
};

export type GroupSummaryLite = {
  label: string;
  // Meta agregada do grupo (a primeira meta ligada a esse group_id), se houver.
  headline: TargetBoardLite | null;
  targetCount: number;
};

// Tela já resolvida para renderizar no telão (get-tv-board, sem auth — acesso por token).
export type ResolvedTvScreen =
  | { id: string; kind: "overview"; dwellSeconds: number; sectors: SectorOverviewLite[] }
  | { id: string; kind: "sector_kpis"; dwellSeconds: number; sectorName: string; metrics: MetricSeriesLite[] }
  | ({ id: string; kind: "target_board"; dwellSeconds: number } & TargetBoardLite)
  | { id: string; kind: "sector_targets"; dwellSeconds: number; sectorName: string; targets: TargetBoardLite[] }
  | { id: string; kind: "group_summary"; dwellSeconds: number; sectorName: string; groups: GroupSummaryLite[] }
  | {
      id: string;
      kind: "metric_spotlight";
      dwellSeconds: number;
      label: string;
      unit: MetricUnit;
      direction: MetricDirection;
      granularity: MetricDefinitionGranularity;
      points: { periodStart: string; value: number }[];
      current: number | null;
    };

export type MetricSeriesLite = {
  label: string;
  unit: MetricUnit;
  direction: MetricDirection;
  granularity: MetricDefinitionGranularity;
  points: { periodStart: string; value: number }[];
};

export type TvBoardView = { label: string; screens: ResolvedTvScreen[] };

// Delegação: quem pode o quê num setor. `userId` é texto solto sem FK (plugin não importa
// contexts/auth/database/schema — regra 7/8 do AGENTS.md); nome/e-mail resolvidos via
// @/contexts/auth (listUsers). Estar aqui não substitui a permission company-metrics.contribute —
// é restrição A MAIS sobre ela (ver shared/scoped-authorization).
export type SectorMemberRecord = {
  sectorId: string;
  userId: string;
  role: SectorMemberRole;
  assignedAt: Date;
};
