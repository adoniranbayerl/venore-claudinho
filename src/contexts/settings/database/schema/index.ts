import { jsonb, pgSchema, text, timestamp } from "drizzle-orm/pg-core";

export const settingsSchema = pgSchema("settings");

// Key-value genérico por site — uma linha por chave, sem singleton artificial.
export const settings = settingsSchema.table("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
