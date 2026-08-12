import { asPluginPage, type PluginRouteTable } from "@/platform/plugin-routing/types";
import AdminPage from "./admin/page";
import PublicPage from "./public/page";

export const donationsRouteTable: PluginRouteTable = {
  admin: [{ pattern: "", Component: asPluginPage(AdminPage) }],
  public: [{ pattern: "donations", Component: asPluginPage(PublicPage) }],
};
