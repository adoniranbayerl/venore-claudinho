import { boolean, integer, pgSchema, text, timestamp } from "drizzle-orm/pg-core";

export const observabilitySchema = pgSchema("observability");

export const observabilityLogEntries = observabilitySchema.table("observability_log_entries", {
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

export const observabilityTraceEntries = observabilitySchema.table("observability_trace_entries", {
  id: text("id").primaryKey(),
  useCase: text("use_case").notNull(),
  actorId: text("actor_id").notNull(),
  success: boolean("success").notNull(),
  durationMs: integer("duration_ms").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
