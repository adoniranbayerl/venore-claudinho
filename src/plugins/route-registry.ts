import type { PluginRouteTable } from "@/platform/plugin-routing/types";
import { academyRouteTable } from "./academy/routes/route-table";
import { birthdaysRouteTable } from "./birthdays/routes/route-table";
import { donationsRouteTable } from "./donations/routes/route-table";
import { broadcastRouteTable } from "./broadcast/routes/route-table";
import { enrollmentDashboardRouteTable } from "./enrollment-dashboard/routes/route-table";

// Registro das route-tables dos plugins instalados, chaveado pela mesma `key` do manifesto (ver
// src/plugins/registry.ts) — mesmo padrão de import estático (Next.js exige pra bundling), agora
// pra roteamento em vez de metadado. Instalar um plugin novo com rota própria é uma entrada nova
// aqui, não um scan de filesystem em runtime.
export const PLUGIN_ROUTE_TABLES: Record<string, PluginRouteTable> = {
  academy: academyRouteTable,
  birthdays: birthdaysRouteTable,
  donations: donationsRouteTable,
  broadcast: broadcastRouteTable,
  "enrollment-dashboard": enrollmentDashboardRouteTable,
};
