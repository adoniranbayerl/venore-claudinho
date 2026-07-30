import { sql } from "drizzle-orm";
import { check, integer, pgSchema, text, timestamp } from "drizzle-orm/pg-core";

export const birthdaysSchema = pgSchema("birthdays");

// createdByUserId é texto solto, sem FK pra auth.users: um plugin não pode importar
// contexts/auth/database/schema (regra 7 — "nunca de store, schema, database/client... vale
// tanto pra leitura quanto escrita"). Mesmo tratamento de academy.courses.createdBy. Usuário
// apagado deixa o id órfão aqui — a camada de exibição precisa tolerar isso (ver
// features/list-birthdays/view.ts).
//
// month/day só têm CHECK de faixa (1..12 / 1..31) — a combinação "31 de fevereiro" não é
// rejeitada pelo banco de propósito; quem valida isso é features/*/validation.ts.
export const birthdays = birthdaysSchema.table(
  "birthdays",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    fullName: text("full_name").notNull(),
    role: text("role"),
    locality: text("locality").notNull().default("Matriz"),
    month: integer("month").notNull(),
    day: integer("day").notNull(),
    createdByUserId: text("created_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("birthdays_month_check", sql`${table.month} between 1 and 12`),
    check("birthdays_day_check", sql`${table.day} between 1 and 31`),
  ],
);
