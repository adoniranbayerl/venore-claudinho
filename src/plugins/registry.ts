import type { PluginManifest } from "@/platform/plugin-engine/manifest-schema";
import { academyManifest } from "./academy/manifest";
import { birthdaysManifest } from "./birthdays/manifest";
import { donationsManifest } from "./donations/manifest";
import { broadcastManifest } from "./broadcast/manifest";
import { companyMetricsManifest } from "./company-metrics/manifest";
import { helpdeskManifest } from "./helpdesk/manifest";

// Registro dos plugins instalados em código (docs/venore-docks.md — "Sistema de plugins"),
// mesmo padrão de src/themes/registry.ts: Next.js exige import estático para bundling, então
// instalar um plugin novo é uma entrada nova aqui, não um scan de filesystem em runtime.
export const PLUGIN_REGISTRY: PluginManifest[] = [
  academyManifest,
  birthdaysManifest,
  donationsManifest,
  broadcastManifest,
  companyMetricsManifest,
  helpdeskManifest,
];
