import { boolean, index, integer, jsonb, pgSchema, text, timestamp } from "drizzle-orm/pg-core";

export const observabilitySchema = pgSchema("observability");
export const auditSchema = pgSchema("audit");

// Log operacional legível por usuário comum (substitui observability_log_entries) — level em vez
// de sucesso/erro binário, origin (context/plugin), summary obrigatório em linguagem natural, e
// detail (payload técnico) só pro expansível da UI, nunca na linha. Sujeito a retenção por
// período e por volume (retention.ts) e ao botão de limpar — é log, é descartável por design.
export const observabilityEvents = observabilitySchema.table(
  "observability_events",
  {
    id: text("id").primaryKey(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    level: text("level").notNull(),
    origin: text("origin").notNull(),
    action: text("action").notNull(),
    actorId: text("actor_id"),
    actorType: text("actor_type"),
    outcome: text("outcome").notNull(),
    summary: text("summary").notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    durationMs: integer("duration_ms").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("observability_events_occurred_at_idx").on(table.occurredAt),
    index("observability_events_level_idx").on(table.level),
    index("observability_events_origin_idx").on(table.origin),
    index("observability_events_actor_id_idx").on(table.actorId),
  ],
);

export const observabilityTraceEntries = observabilitySchema.table("observability_trace_entries", {
  id: text("id").primaryKey(),
  useCase: text("use_case").notNull(),
  actorId: text("actor_id").notNull(),
  success: boolean("success").notNull(),
  durationMs: integer("duration_ms").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Auditoria de segurança — tabela separada de propósito (FASE 1, decisão confirmada com o
// usuário): log operacional é descartável (retenção + botão de limpar), auditoria não pode ser
// apagada por nenhuma ação de admin. Sem índice/mecanismo de expurgo, sem action de "clear"
// exposta em lugar nenhum do código.
export const securityAuditEvents = auditSchema.table(
  "security_audit_events",
  {
    id: text("id").primaryKey(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    action: text("action").notNull(),
    actorId: text("actor_id"),
    actorType: text("actor_type"),
    outcome: text("outcome").notNull(),
    summary: text("summary").notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("security_audit_events_occurred_at_idx").on(table.occurredAt),
    index("security_audit_events_actor_id_idx").on(table.actorId),
  ],
);
