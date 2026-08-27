import { boolean, pgSchema, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "@/contexts/auth/database/schema";

export const extensionsSchema = pgSchema("extensions");

// Uma linha por (kind, key). Duas dimensões independentes:
// - `installed_at`: nulo == NÃO instalado. Pra plugin, não instalado significa "disponível" —
//   não contribui navegação/permission/bloco/setting (register-plugins.ts), a tela de admin
//   mostra um botão "Instalar" que roda as migrations do plugin (run-plugin-migrations.ts).
//   Pra tema, `installed_at` é ignorado pelo theme-engine (tema está sempre em código, sem
//   etapa de instalação) — a migration de backfill preenche mesmo assim, por consistência.
// - `enabled`: só relevante quando instalado. `installed_at` preenchido + `enabled=false` ==
//   instalado e desligado pelo admin (schema/dados do plugin permanecem intactos — desabilitar
//   e até "desinstalar da pasta" nunca apagam dado por si).
// Ausência de linha == não instalado E habilitado-por-default (o default de `enabled` só vale
// quando a linha passa a existir, no install ou no primeiro disable).
export const extensionState = extensionsSchema.table(
  "extension_state",
  {
    kind: text("kind").notNull().$type<"plugin" | "theme">(),
    key: text("key").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    installedAt: timestamp("installed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedByUserId: text("updated_by_user_id").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [primaryKey({ columns: [table.kind, table.key] })],
);
