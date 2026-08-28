import { sql } from "drizzle-orm";
import {
  check,
  date,
  doublePrecision,
  integer,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const companyMetricsSchema = pgSchema("company_metrics");

// Fase 1 — docs/metricas-internas-plugin.md §2.1. Métricas/valores/metas/telas entram nas fases
// seguintes, cada uma com sua própria migration.

// key é slug do nome, gerado em create-sector/service.ts (nunca digitado, nunca reeditado) —
// vira parte da URL das telas de TV e é o identificador estável entre reordenações. archived_at
// != null esconde o setor das listagens sem apagar histórico.
export const sectors = companyMetricsSchema.table(
  "sectors",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    // Nome de ícone lucide (ex: "briefcase") escolhido pelo admin numa lista fixa — não é cor nem
    // valor de design, só um enum de identidade visual do setor. null cai num ícone padrão.
    icon: text("icon"),
    position: integer("position").notNull().default(0),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("company_metrics_sectors_key_idx").on(table.key)],
);

// Agrupamento opcional dentro de um setor — absorve "instituição" do antigo enrollment-dashboard
// (Erasto/Fidelis) e serve genérico. logo_media_id é texto solto sem FK (mesmo racional de
// broadcast/enrollment: plugin não importa contexts/media/database/schema; resolução via
// @/contexts/media getMediaAsset). key é slug, único por setor.
export const sectorGroups = companyMetricsSchema.table(
  "sector_groups",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sectorId: text("sector_id")
      .notNull()
      .references(() => sectors.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    logoMediaId: text("logo_media_id"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("company_metrics_sector_groups_key_idx").on(table.sectorId, table.key)],
);

// Delegação por setor (§3). user_id é texto solto sem FK — mesmo racional de
// broadcast_agenda_editors. Uma linha por (setor, pessoa): a pessoa tem exatamente um papel no
// setor. role >= "editor" lança valores; role = "admin" configura o setor e delega editor/viewer;
// só company-metrics.manage delega/remove "admin" (ver set-sector-members/service.ts).
export const sectorMembers = companyMetricsSchema.table(
  "sector_members",
  {
    sectorId: text("sector_id")
      .notNull()
      .references(() => sectors.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: text("role").notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.sectorId, table.userId] }),
    check("company_metrics_sector_members_role_check", sql`${table.role} in ('admin','editor','viewer')`),
  ],
);

// Fase 2 — docs/metricas-internas-plugin.md §2.1.

// Uma métrica que o setor acompanha ("Alunos matriculados", "Receita recorrente", "Leads").
// group_id (opcional) → sector_groups com onDelete "set null": apagar o grupo desvincula, não
// apaga a definição. key é slug do label, único por setor.
// - unit: formatação/eixo (contagem, R$, %, dias).
// - aggregation: como os valores de vários períodos viram um número num intervalo maior
//   (sum: leads/entradas; last: estoque/saldo; average: ticket médio/NPS).
// - granularity: cadência de lançamento (o editor lança "valor de agosto", "da semana 32"…).
// - direction: se subir é bom (up_good) ou ruim (down_good) — só leitura/cor no painel.
export const metricDefinitions = companyMetricsSchema.table(
  "metric_definitions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sectorId: text("sector_id")
      .notNull()
      .references(() => sectors.id, { onDelete: "cascade" }),
    groupId: text("group_id").references(() => sectorGroups.id, { onDelete: "set null" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    unit: text("unit").notNull(),
    aggregation: text("aggregation").notNull(),
    granularity: text("granularity").notNull(),
    direction: text("direction").notNull(),
    position: integer("position").notNull().default(0),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("company_metrics_metric_definitions_key_idx").on(table.sectorId, table.key),
    check("company_metrics_metric_definitions_unit_check", sql`${table.unit} in ('count','currency_brl','percent','days')`),
    check(
      "company_metrics_metric_definitions_aggregation_check",
      sql`${table.aggregation} in ('sum','last','average')`,
    ),
    check(
      "company_metrics_metric_definitions_granularity_check",
      sql`${table.granularity} in ('daily','weekly','monthly')`,
    ),
    check(
      "company_metrics_metric_definitions_direction_check",
      sql`${table.direction} in ('up_good','down_good')`,
    ),
  ],
);

// Um valor lançado para uma definição, num período. É o que o papel "editor" atualiza.
// period_start é sempre um início de bucket normalizado à granularity da definição
// (shared/period.ts). uq (definition_id, period_start) → o lançamento é um upsert por período.
// entered_by_user_id é texto solto sem FK (mesmo racional de sector_members.user_id).
export const metricValues = companyMetricsSchema.table(
  "metric_values",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    definitionId: text("definition_id")
      .notNull()
      .references(() => metricDefinitions.id, { onDelete: "cascade" }),
    periodStart: date("period_start", { mode: "string" }).notNull(),
    value: doublePrecision("value").notNull(),
    note: text("note"),
    enteredByUserId: text("entered_by_user_id"),
    enteredAt: timestamp("entered_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("company_metrics_metric_values_period_idx").on(table.definitionId, table.periodStart)],
);

// Fase 3 — docs/metricas-internas-plugin.md §2.2.

// Uma meta do setor num intervalo ("300 entradas em 2026/2"). on_track_threshold é a fração de
// conclusão a partir da qual a meta conta como "no ritmo" (default 0.85) — decisão por meta, não
// constante mágica. group_id opcional (mesmo racional das definições).
export const targets = companyMetricsSchema.table(
  "targets",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sectorId: text("sector_id")
      .notNull()
      .references(() => sectors.id, { onDelete: "cascade" }),
    groupId: text("group_id").references(() => sectorGroups.id, { onDelete: "set null" }),
    label: text("label").notNull(),
    description: text("description"),
    targetValue: doublePrecision("target_value").notNull(),
    periodStart: date("period_start", { mode: "string" }).notNull(),
    periodEnd: date("period_end", { mode: "string" }).notNull(),
    onTrackThreshold: doublePrecision("on_track_threshold").notNull().default(0.85),
    position: integer("position").notNull().default(0),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

// O relacionamento meta ↔ métricas: cada linha liga uma definição à meta com um peso e uma
// classificação. classification decide como o valor entra no cálculo (shared/metric-rollup.ts):
// realized conta pro número principal; at_risk/projected só na leitura otimista; subtract abate.
export const targetInputs = companyMetricsSchema.table(
  "target_inputs",
  {
    targetId: text("target_id")
      .notNull()
      .references(() => targets.id, { onDelete: "cascade" }),
    definitionId: text("definition_id")
      .notNull()
      .references(() => metricDefinitions.id, { onDelete: "cascade" }),
    weight: doublePrecision("weight").notNull().default(1),
    classification: text("classification").notNull(),
    position: integer("position").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.targetId, table.definitionId] }),
    check(
      "company_metrics_target_inputs_classification_check",
      sql`${table.classification} in ('realized','at_risk','projected','subtract')`,
    ),
  ],
);
