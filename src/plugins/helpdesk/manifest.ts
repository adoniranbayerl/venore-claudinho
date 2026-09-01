import type { PluginManifest } from "@/platform/plugin-engine/manifest-schema";

// Faixa de compatibilidade escrita à mão, não importada de core-version.ts — mesmo motivo dos
// demais manifestos (importar o CORE_VERSION corrente tornaria a checagem trivial).
//
// Independência: este plugin NÃO declara `dependencies` — funciona instalado sozinho
// (§0 de docs/chamados-plugin.md).
export const helpdeskManifest: PluginManifest = {
  manifestVersion: "1.0.0",
  key: "helpdesk",
  name: "Chamados",
  version: "1.0.0",
  description:
    "Abertura e controle de chamados para as equipes internas de TI e Manutenção — filas por equipe, área administrativa, app do técnico, quiosque por QR e painéis de TV.",
  compatibility: { coreVersion: ">=2.0.0 <3.0.0" },
  // Schema próprio do plugin — aplicado no install (run-plugin-migrations.ts), não no vercel-build.
  migrationsPath: "./migrations",
  migrationsSchema: "helpdesk_migrations",
  permissions: [
    {
      key: "helpdesk.manage",
      label: "Administrar Chamados — filas, SLA, categorias, quiosques, painéis; ver, atribuir e fechar qualquer chamado",
    },
    {
      key: "helpdesk.work",
      label: "Atender os chamados das filas de Chamados atribuídas a você (papel na fila)",
    },
    {
      key: "helpdesk.read",
      label: "Acompanhar a fila e a timeline de qualquer chamado, sem agir",
    },
  ],
  navigation: [
    {
      key: "helpdesk.admin",
      label: "Chamados",
      href: "/admin/helpdesk",
      icon: "life-buoy",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 60,
      requiredPermission: ["helpdesk.manage", "helpdesk.work", "helpdesk.read"],
    },
  ],
  seeds: [
    {
      key: "example",
      label: "Filas de exemplo",
      description: "TI e Manutenção com algumas categorias — a base para começar a receber chamados.",
    },
  ],
};
