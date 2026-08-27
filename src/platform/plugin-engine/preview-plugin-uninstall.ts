import { sql } from "drizzle-orm";
import { listExtensionStates } from "@/contexts/extensions";
// Import direto do client de infra (não de um store de context): é plumbing de inspeção do
// banco — não existe um context "dono" de "listar as tabelas do schema arbitrário de um plugin".
// Mesma natureza de run-plugin-migrations.ts, e o boundary de lint não restringe
// platform/ -> infrastructure/. NUNCA abrir um Pool próprio aqui (AGENTS.md seção 2).
import { db } from "@/infrastructure/database/client";
import { PLUGIN_REGISTRY } from "@/plugins/registry";
import { previewPluginDisable, type PluginDisablePreview } from "./preview-plugin-disable";
import { resolvePluginDataSchema } from "./resolve-plugin-data-schema";
import { resolveMigrationsSchema } from "./run-plugin-migrations";

// Estende PluginDisablePreview (mesma base: quem depende, navegação/permission que somem,
// usuários afetados) com o que a desinstalação "modo B — limpar banco" apaga além do que
// desativar apaga (nada): os schemas Postgres dropados, a contagem de linhas de cada tabela do
// plugin, as settings do namespace `<key>.*` e as concessões de permission `<key>.*` em
// rbac.role_permissions. Computado sob demanda (server action ao abrir o diálogo), não pra todos
// os plugins no load da página, porque envolve um COUNT(*) por tabela do plugin.
export type PluginUninstallPreview = PluginDisablePreview & {
  installed: boolean;
  // null == plugin sem schema próprio (settings-only, ex: donations): nada é dropado no banco.
  dataSchema: string | null;
  migrationsSchema: string | null;
  tables: { name: string; rowCount: number }[];
  settingsCount: number;
  grantedPermissionCount: number;
};

async function scalarCount(query: ReturnType<typeof sql>): Promise<number> {
  const result = await db.execute(query);
  return Number((result.rows[0] as { count: string | number }).count);
}

export async function previewPluginUninstall(pluginKey: string): Promise<PluginUninstallPreview> {
  const base = await previewPluginDisable(pluginKey);

  const manifest = PLUGIN_REGISTRY.find((entry) => entry.key === pluginKey);
  const states = await listExtensionStates({ kind: "plugin" });
  const installed = states.success && Boolean(states.data[pluginKey]?.installed);

  const dataSchema = manifest?.migrationsPath ? resolvePluginDataSchema(pluginKey) : null;
  const migrationsSchema = manifest?.migrationsPath
    ? resolveMigrationsSchema(pluginKey, manifest.migrationsSchema)
    : null;

  const tables: { name: string; rowCount: number }[] = [];
  if (dataSchema) {
    const tableRows = await db.execute(sql`
      select table_name from information_schema.tables
      where table_schema = ${dataSchema} and table_type = 'BASE TABLE'
      order by table_name
    `);
    for (const row of tableRows.rows as { table_name: string }[]) {
      const rowCount = await scalarCount(
        sql.raw(`select count(*)::int as count from "${dataSchema}"."${row.table_name}"`),
      );
      tables.push({ name: row.table_name, rowCount });
    }
  }

  const settingsCount = await scalarCount(
    sql`select count(*)::int as count from settings.settings where key like ${`${pluginKey}.%`}`,
  );
  const grantedPermissionCount = await scalarCount(
    sql`select count(*)::int as count from rbac.role_permissions where permission_key like ${`${pluginKey}.%`}`,
  );

  return {
    ...base,
    installed,
    dataSchema,
    migrationsSchema,
    tables,
    settingsCount,
    grantedPermissionCount,
  };
}
