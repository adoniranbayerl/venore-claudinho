import { asPluginPage, type PluginRouteTable } from "@/platform/plugin-routing/types";
import AdminPage from "./admin/page";

// admin: área administrativa (/admin/helpdesk), abas dirigidas por ?tab=.
// Fase 1 só tem a área admin. Portal do solicitante, app do técnico, quiosque e painéis entram
// nas fases seguintes (docs/chamados-plugin.md §4).
export const helpdeskRouteTable: PluginRouteTable = {
  admin: [{ pattern: "", Component: asPluginPage(AdminPage) }],
};
