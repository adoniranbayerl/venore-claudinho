import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const observabilityLogEntries = pgTable("observability_log_entries", {
  id: text("id").primaryKey(),
  useCase: text("use_case").notNull(),
  actorId: text("actor_id").notNull(),
  actorType: text("actor_type").notNull(),
  kind: text("kind").notNull(),
  success: boolean("success").notNull(),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  durationMs: integer("duration_ms").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const observabilityTraceEntries = pgTable("observability_trace_entries", {
  id: text("id").primaryKey(),
  useCase: text("use_case").notNull(),
  actorId: text("actor_id").notNull(),
  success: boolean("success").notNull(),
  durationMs: integer("duration_ms").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
