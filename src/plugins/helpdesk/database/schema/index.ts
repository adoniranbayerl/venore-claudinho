import { sql } from "drizzle-orm";
import { check, integer, pgSchema, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const helpdeskSchema = pgSchema("helpdesk");

// Fase 1 — docs/chamados-plugin.md §2.1. Chamados/timeline/anexos/notificações/SLA/quiosques/
// painéis entram nas fases seguintes, cada uma com sua própria migration.

// key é slug do nome, gerado em create-queue/service.ts (nunca digitado, nunca reeditado) — vira
// parte da URL dos painéis e do prefixo do número do chamado. archived_at != null esconde a fila
// das listagens sem apagar histórico.
export const queues = helpdeskSchema.table(
  "queues",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    // Nome de ícone lucide (ex: "wrench") escolhido numa lista fixa — não é cor nem valor de
    // design, só um enum de identidade visual da fila. null cai num ícone padrão.
    icon: text("icon"),
    position: integer("position").notNull().default(0),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("helpdesk_queues_key_idx").on(table.key)],
);

// Delegação por fila (§3). user_id é texto solto sem FK — mesmo racional de
// company_metrics.sector_members / broadcast_agenda_editors (plugin não importa
// contexts/auth/database/schema). Uma linha por (fila, pessoa). role = "manager" configura a
// fila e delega "agent"; role = "agent" só atende. Só helpdesk.manage delega/remove "manager".
export const queueMembers = helpdeskSchema.table(
  "queue_members",
  {
    queueId: text("queue_id")
      .notNull()
      .references(() => queues.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: text("role").notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.queueId, table.userId] }),
    check("helpdesk_queue_members_role_check", sql`${table.role} in ('manager','agent')`),
  ],
);

// Categoria opcional de uma fila ("Rede", "Impressora", "Ar-condicionado", "Elétrica"). key é
// slug do label, único por fila. archived_at aposenta sem quebrar chamados antigos.
export const categories = helpdeskSchema.table(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    queueId: text("queue_id")
      .notNull()
      .references(() => queues.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    position: integer("position").notNull().default(0),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("helpdesk_categories_key_idx").on(table.queueId, table.key)],
);
