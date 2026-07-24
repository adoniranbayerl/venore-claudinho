import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "src/contexts/*/database/schema/index.ts",
    "src/observability/database/schema/index.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
