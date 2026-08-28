import { sql } from "drizzle-orm";
import { check, integer, pgSchema, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

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
