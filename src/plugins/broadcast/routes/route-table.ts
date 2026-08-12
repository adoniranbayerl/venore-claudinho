import { asPluginApiHandler, asPluginPage, type PluginRouteTable } from "@/platform/plugin-routing/types";
import AdminPage from "./admin/page";
import { GET as streamGET } from "./api/stream/route";
import { GET as outputEventsGET } from "./api/output-events/route";
import { GET as outputStateGET } from "./api/output-state/route";

// A view de saída (out/[token]) fica fora de (platform) de propósito (sem shell) — continua como
// pasta própria em src/app/broadcast/out/[token]/, não entra nesta tabela (ver comentário lá).
export const broadcastRouteTable: PluginRouteTable = {
  admin: [{ pattern: "", Component: asPluginPage(AdminPage) }],
  api: [
    { pattern: "stream/:itemId", handlers: { GET: asPluginApiHandler(streamGET) } },
    { pattern: "output/:token/events", handlers: { GET: asPluginApiHandler(outputEventsGET) } },
    { pattern: "output/:token/state", handlers: { GET: asPluginApiHandler(outputStateGET) } },
  ],
};
