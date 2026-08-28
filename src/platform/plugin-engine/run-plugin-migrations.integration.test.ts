import { sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/infrastructure/database/client";
import { runPluginMigrations } from "./run-plugin-migrations";

// Alvo: company-metrics (nenhum outro teste de integração toca seu schema). Prova que
// runPluginMigrations aplica SÓ a árvore daquele plugin, numa tabela de tracking isolada, sem
// mexer no cursor de migration do core.
const PLUGIN_SCHEMA = "company_metrics";
const TRACKING_SCHEMA = "company_metrics_migrations";

async function countRows(query: ReturnType<typeof sql>): Promise<number> {
  const result = await db.execute(query);
  return Number((result.rows[0] as { count: string | number }).count);
}

describe("runPluginMigrations (integração)", () => {
  afterAll(async () => {
    // Recompõe o schema pra qualquer teste posterior (a suíte roda sequencial, mas o globalSetup
    // não roda de novo entre arquivos).
    await runPluginMigrations("company-metrics");
  });

  it("aplica só o schema do plugin, com tracking isolado, sem tocar o tracking do core", async () => {
    const coreMigrationsBefore = await countRows(sql`select count(*)::int as count from drizzle.__drizzle_migrations`);

    await db.execute(sql.raw(`DROP SCHEMA IF EXISTS "${PLUGIN_SCHEMA}" CASCADE`));
    await db.execute(sql.raw(`DROP SCHEMA IF EXISTS "${TRACKING_SCHEMA}" CASCADE`));

    const result = await runPluginMigrations("company-metrics");
    expect(result.success).toBe(true);

    // O schema do plugin voltou, com tabelas das suas migrations.
    const pluginTables = await countRows(sql`
      select count(*)::int as count from information_schema.tables
      where table_schema = ${PLUGIN_SCHEMA} and table_name in ('sectors', 'metric_definitions', 'targets', 'tv_boards')
    `);
    expect(pluginTables).toBe(4);

    // A tabela de tracking do plugin existe e registrou as migrations aplicadas.
    const trackedByPlugin = await countRows(
      sql.raw(`select count(*)::int as count from "${TRACKING_SCHEMA}".__drizzle_migrations`),
    );
    expect(trackedByPlugin).toBeGreaterThanOrEqual(1);

    // O tracking do core não foi tocado.
    const coreMigrationsAfter = await countRows(sql`select count(*)::int as count from drizzle.__drizzle_migrations`);
    expect(coreMigrationsAfter).toBe(coreMigrationsBefore);
  });

  it("erro claro quando o plugin não declara migrationsPath", async () => {
    const result = await runPluginMigrations("donations");
    expect(result).toEqual({
      success: false,
      error: { code: "plugin-engine.migrations.not_declared", message: expect.any(String) },
    });
  });
});
