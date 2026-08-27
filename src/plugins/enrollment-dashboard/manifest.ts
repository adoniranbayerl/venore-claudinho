import type { PluginManifest } from "@/platform/plugin-engine/manifest-schema";

// Faixa escrita à mão, não importada de platform/plugin-engine/core-version.ts — mesmo motivo do
// birthdaysManifest (src/plugins/birthdays/manifest.ts): importar o CORE_VERSION corrente
// tornaria a checagem de compatibilidade sempre trivialmente satisfeita.
export const enrollmentDashboardManifest: PluginManifest = {
  manifestVersion: "1.0.0",
  key: "enrollment-dashboard",
  name: "Dashboard de Matrícula",
  version: "1.0.0",
  description: "Painel de meta, rematrícula e novas matrículas por instituição/curso.",
  compatibility: { coreVersion: ">=2.0.0 <3.0.0" },
  // Schema próprio do plugin — aplicado no install (run-plugin-migrations.ts), não no
  // vercel-build. migrationsSchema explícito porque a key tem hífen (o default derivado seria o
  // mesmo, mas deixa explícito que bate com src/plugins/enrollment-dashboard/drizzle.config.ts).
  migrationsPath: "./migrations",
  migrationsSchema: "enrollment_dashboard_migrations",
  permissions: [
    { key: "enrollment-dashboard.read", label: "Ver o dashboard de matrícula" },
    { key: "enrollment-dashboard.manage", label: "Gerenciar instituições, turmas e cursos do dashboard de matrícula" },
  ],
  seeds: [
    {
      key: "example",
      label: "Dados de exemplo",
      description: "Colégio Erasto Gaertner e Faculdade Fidelis com turmas e cursos.",
    },
  ],
  navigation: [
    {
      key: "enrollment-dashboard.admin",
      label: "Matrículas",
      href: "/admin/enrollment-dashboard",
      icon: "activity",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 40,
      requiredPermission: "enrollment-dashboard.read",
    },
  ],
};
