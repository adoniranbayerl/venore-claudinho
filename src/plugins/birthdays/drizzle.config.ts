import { defineConfig } from "drizzle-kit";

// Migrations próprias do plugin (mesmo padrão de src/plugins/academy/drizzle.config.ts —
// docs/venore-docks.md, "Sistema de plugins" / "Schema e migrations"): separado do
// drizzle.config.ts raiz de propósito, pra core e birthdays não competirem pela mesma história
// de migration.
export default defineConfig({
  schema: ["src/plugins/birthdays/database/schema/index.ts"],
  out: "./src/plugins/birthdays/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
