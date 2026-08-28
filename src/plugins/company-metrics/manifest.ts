import type { PluginManifest } from "@/platform/plugin-engine/manifest-schema";
import { COMPANY_METRICS_SETTINGS } from "./shared/settings";

// Faixa de compatibilidade escrita à mão, não importada de core-version.ts — mesmo motivo dos
// demais manifestos (importar o CORE_VERSION corrente tornaria a checagem trivial).
//
// Independência: este plugin NÃO declara `dependencies` — funciona instalado sozinho, sem
// broadcast nem enrollment-dashboard (§0 de docs/metricas-internas-plugin.md). O Broadcast
// consome as telas de TV por rota (item de playlist "webpage"), nunca por dependência mútua.
export const companyMetricsManifest: PluginManifest = {
  manifestVersion: "1.0.0",
  key: "company-metrics",
  name: "Métricas Internas",
  version: "1.0.0",
  description:
    "Setores da empresa com métricas e metas próprias — área administrativa, visualização para gestores e telas para TV.",
  compatibility: { coreVersion: ">=2.0.0 <3.0.0" },
  // Schema próprio do plugin — aplicado no install (run-plugin-migrations.ts), não no vercel-build.
  migrationsPath: "./migrations",
  migrationsSchema: "company_metrics_migrations",
  permissions: [
    {
      key: "company-metrics.manage",
      label: "Gerenciar todos os setores, métricas, metas e telas de Métricas Internas",
    },
    {
      key: "company-metrics.contribute",
      label: "Editar os setores de Métricas Internas atribuídos a você (papel editor pra cima)",
    },
    {
      key: "company-metrics.read",
      label: "Ver a visualização de Métricas Internas dos setores autorizados",
    },
  ],
  settings: Object.values(COMPANY_METRICS_SETTINGS).map(({ key, defaultValue }) => ({ key, defaultValue })),
  seeds: [
    {
      key: "example",
      label: "Setores de exemplo",
      description: "Comercial, Financeiro e Marketing — a base para começar a cadastrar métricas.",
    },
  ],
  navigation: [
    {
      key: "company-metrics.admin",
      label: "Métricas Internas",
      href: "/admin/company-metrics",
      icon: "gauge",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 50,
      // company-metrics.read sozinho NÃO entra no admin — quem só lê usa /metricas (Fase 4).
      requiredPermission: ["company-metrics.manage", "company-metrics.contribute"],
    },
  ],
};
