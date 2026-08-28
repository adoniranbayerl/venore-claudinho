import { asPluginPage, type PluginRouteTable } from "@/platform/plugin-routing/types";
import AdminPage from "./admin/page";
import PublicPage from "./public/page";

// admin: área administrativa (/admin/company-metrics).
// public: visualização interativa para gestores (/metricas) — caminho completo, despachada pelo
// catch-all do CMS, herda a shell do (platform). A tela de TV (Fase 5) é shim fora de (platform),
// não entra aqui.
export const companyMetricsRouteTable: PluginRouteTable = {
  admin: [{ pattern: "", Component: asPluginPage(AdminPage) }],
  public: [{ pattern: "metricas", Component: asPluginPage(PublicPage) }],
};
