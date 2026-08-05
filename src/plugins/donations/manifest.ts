import type { PluginManifest } from "@/platform/plugin-engine/manifest-schema";
import { DONATIONS_SETTINGS } from "./shared/settings";

// Faixa escrita à mão, não importada de platform/plugin-engine/core-version.ts — mesmo motivo do
// academyManifest/birthdaysManifest: importar o CORE_VERSION corrente tornaria a checagem de
// compatibilidade sempre trivialmente satisfeita.
export const donationsManifest: PluginManifest = {
  manifestVersion: "1.0.0",
  key: "donations",
  name: "Doações",
  version: "1.0.0",
  description: "Doação via PIX com chave estática (BR Code) — valor livre, sem gateway de pagamento.",
  compatibility: { coreVersion: ">=2.0.0 <3.0.0" },
  // Uma permission só: não existe uma tela de listagem separada (não há registro de doação
  // persistido, ver docs/venore-docks.md — plugin "settings-only") que justifique uma
  // "donations.read" distinta, diferente de birthdays (que tem CRUD de registros).
  permissions: [{ key: "donations.manage", label: "Configurar chave PIX e aparência da doação" }],
  settings: Object.values(DONATIONS_SETTINGS).map(({ key, defaultValue }) => ({ key, defaultValue })),
  navigation: [
    {
      key: "donations.admin",
      label: "Doações",
      href: "/admin/donations",
      icon: "heart-handshake",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 30,
      requiredPermission: "donations.manage",
    },
  ],
  blocks: [
    { key: "donations.pix-widget", label: "Doações — Widget PIX" },
    { key: "donations.pix-teaser", label: "Doações — Chamada rápida" },
  ],
};
