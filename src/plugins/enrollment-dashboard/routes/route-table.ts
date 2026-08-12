import { asPluginPage, type PluginRouteTable } from "@/platform/plugin-routing/types";
import AdminPage from "./admin/page";

// present/[token]/[institutionKey] fica fora de (platform) de propósito (sem shell) — continua
// como pasta própria em src/app/enrollment-dashboard/present/**, não entra nesta tabela.
export const enrollmentDashboardRouteTable: PluginRouteTable = {
  admin: [{ pattern: "", Component: asPluginPage(AdminPage) }],
};
