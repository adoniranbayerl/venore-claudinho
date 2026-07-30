import { boolean, pgSchema, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "@/contexts/auth/database/schema";

export const extensionsSchema = pgSchema("extensions");

// Uma linha por (kind, key) — ausência de linha significa habilitado (default implícito), então
// instalar um plugin/tema novo nunca exige seed: só passa a existir uma linha aqui quando alguém
// desabilita algo pela primeira vez. Desabilitar nunca apaga dado de outro domínio (schema/dados
// do plugin/tema em si permanecem intactos) — esta tabela só guarda a chave liga/desliga.
export const extensionState = extensionsSchema.table(
  "extension_state",
  {
    kind: text("kind").notNull().$type<"plugin" | "theme">(),
    key: text("key").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedByUserId: text("updated_by_user_id").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [primaryKey({ columns: [table.kind, table.key] })],
);
