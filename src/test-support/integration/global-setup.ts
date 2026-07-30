import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { requireTestDatabaseUrl } from "./require-test-database-url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_MIGRATIONS_FOLDER = path.resolve(dirname, "../../../drizzle");
const ACADEMY_MIGRATIONS_FOLDER = path.resolve(dirname, "../../plugins/academy/migrations");
const BIRTHDAYS_MIGRATIONS_FOLDER = path.resolve(dirname, "../../plugins/birthdays/migrations");

// Roda 1x antes da suíte inteira (contrato de globalSetup do Vitest), num Pool próprio — nunca o
// singleton de app/infrastructure/database/client.ts — porque a validação de TEST_DATABASE_URL
// precisa acontecer antes de qualquer módulo de app ser importado.
export default async function globalSetup(): Promise<void> {
  const connectionString = requireTestDatabaseUrl();
  const pool = new Pool({ connectionString });
  const db = drizzle({ client: pool });

  try {
    // Três migrations separadas, mesmo padrão de produção (db:migrate + db:migrate:academy +
    // db:migrate:birthdays) — core (auth/rbac/cms/settings/observability) e o schema próprio de
    // cada plugin.
    await migrate(db, { migrationsFolder: CORE_MIGRATIONS_FOLDER });
    await migrate(db, { migrationsFolder: ACADEMY_MIGRATIONS_FOLDER });
    await migrate(db, { migrationsFolder: BIRTHDAYS_MIGRATIONS_FOLDER });
  } finally {
    await pool.end();
  }
}
