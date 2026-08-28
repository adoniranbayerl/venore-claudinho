import { asPluginPage, type PluginRouteTable } from "@/platform/plugin-routing/types";
import AdminPage from "./admin/page";

// Fase 1 — só a área administrativa. A visualização interativa pública (/metricas, Fase 4) e a
// tela de TV (Fase 5, shim fora de (platform)) entram depois.
export const companyMetricsRouteTable: PluginRouteTable = {
  admin: [{ pattern: "", Component: asPluginPage(AdminPage) }],
};
