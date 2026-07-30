import { sql } from "drizzle-orm";
import { boolean, check, integer, pgSchema, text, timestamp } from "drizzle-orm/pg-core";

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

// Uma linha por importação de CSV confirmada (não por linha do arquivo) — histórico de quem
// importou e quantas linhas entraram/foram ignoradas. O beginOperation/endOperation genérico
// (@/observability) não carrega contagens por domínio, só sucesso/falha + duração, então essa
// tabela é o registro de auditoria específico do plugin pra esse requisito.
export const birthdayImports = birthdaysSchema.table("birthday_imports", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  importedByUserId: text("imported_by_user_id"),
  totalRows: integer("total_rows").notNull(),
  insertedRows: integer("inserted_rows").notNull(),
  skippedErrorRows: integer("skipped_error_rows").notNull(),
  skippedDuplicateRows: integer("skipped_duplicate_rows").notNull(),
  includedDuplicates: boolean("included_duplicates").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
