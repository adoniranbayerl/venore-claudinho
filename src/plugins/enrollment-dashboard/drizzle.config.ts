import { defineConfig } from "drizzle-kit";

// Migrations próprias do plugin, mesmo padrão de src/plugins/birthdays/drizzle.config.ts: core e
// enrollment-dashboard não podem competir pela mesma história de migration.
export default defineConfig({
  schema: ["src/plugins/enrollment-dashboard/database/schema/index.ts"],
  out: "./src/plugins/enrollment-dashboard/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  migrations: { schema: "enrollment_dashboard_migrations", table: "__drizzle_migrations" },
});
