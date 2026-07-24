import { defineConfig } from "drizzle-kit";

// Migrations próprias do plugin (docs/venore-docks.md — "Sistema de plugins" / "Schema e
// migrations": "Cada plugin numera suas próprias migrations dentro da própria pasta"). Separado
// do drizzle.config.ts raiz de propósito — evita o core e o academy competirem pela mesma
// história de migration nas mesmas tabelas.
export default defineConfig({
  schema: ["src/plugins/academy/database/schema/index.ts"],
  out: "./src/plugins/academy/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
