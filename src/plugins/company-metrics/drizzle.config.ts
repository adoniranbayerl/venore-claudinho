import { defineConfig } from "drizzle-kit";

// Migrations próprias do plugin, mesmo padrão de src/plugins/enrollment-dashboard/drizzle.config.ts:
// core e company-metrics não podem competir pela mesma história de migration. Tabela de tracking
// própria (company_metrics_migrations) — aplicada no install (run-plugin-migrations.ts), nunca no
// vercel-build.
export default defineConfig({
  schema: ["src/plugins/company-metrics/database/schema/index.ts"],
  out: "./src/plugins/company-metrics/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  migrations: { schema: "company_metrics_migrations", table: "__drizzle_migrations" },
});
