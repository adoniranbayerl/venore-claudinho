// Schema Postgres onde moram as tabelas de dado próprias de um plugin: a key com "-" trocado
// por "_" (ex: "enrollment-dashboard" -> "enrollment_dashboard"). É o que o `CREATE SCHEMA` da
// migration 0000 de cada plugin com schema usa, e o mesmo prefixo do schema de tracking
// (`<data>_migrations`, ver run-plugin-migrations.ts — resolveMigrationsSchema). Um plugin sem
// migrationsPath (settings-only, ex: donations) não tem schema de dado — quem chama trata o
// null.
export function resolvePluginDataSchema(pluginKey: string): string {
  return pluginKey.replace(/-/g, "_");
}
