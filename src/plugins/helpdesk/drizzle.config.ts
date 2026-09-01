import { defineConfig } from "drizzle-kit";

// Migrations próprias do plugin, mesmo padrão de src/plugins/company-metrics/drizzle.config.ts:
// core e helpdesk não podem competir pela mesma história de migration. Tabela de tracking própria
// (helpdesk_migrations) — aplicada no install (run-plugin-migrations.ts), nunca no vercel-build.
export default defineConfig({
  schema: ["src/plugins/helpdesk/database/schema/index.ts"],
  out: "./src/plugins/helpdesk/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  migrations: { schema: "helpdesk_migrations", table: "__drizzle_migrations" },
});
