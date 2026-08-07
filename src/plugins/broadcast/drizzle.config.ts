import { defineConfig } from "drizzle-kit";

// Migrations próprias do plugin (mesmo padrão de src/plugins/birthdays/drizzle.config.ts —
// docs/venore-docks.md, "Sistema de plugins" / "Schema e migrations"): separado do
// drizzle.config.ts raiz de propósito, pra core e broadcast não competirem pela mesma história de
// migration.
export default defineConfig({
  schema: ["src/plugins/broadcast/database/schema/index.ts"],
  out: "./src/plugins/broadcast/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  // Mesmo racional de src/plugins/birthdays/drizzle.config.ts: tabela de tracking própria, pra não
  // compartilhar o cursor de "última migration aplicada" com core (nem com outro plugin).
  migrations: { schema: "broadcast_migrations", table: "__drizzle_migrations" },
});
