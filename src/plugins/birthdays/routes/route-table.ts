import { asPluginApiHandler, asPluginPage, type PluginRouteTable } from "@/platform/plugin-routing/types";
import AdminPage from "./admin/page";
import AdminAppearancePage from "./admin-appearance/page";
import PublicPage from "./public/page";
import { GET as importTemplateGET } from "./api/import-template/route";

export const birthdaysRouteTable: PluginRouteTable = {
  admin: [
    { pattern: "", Component: asPluginPage(AdminPage) },
    { pattern: "appearance", Component: asPluginPage(AdminAppearancePage) },
  ],
  public: [{ pattern: "birthdays", Component: asPluginPage(PublicPage) }],
  api: [{ pattern: "import-template", handlers: { GET: asPluginApiHandler(importTemplateGET) } }],
};
