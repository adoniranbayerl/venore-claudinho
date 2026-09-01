import { asPluginApiHandler, asPluginPage, type PluginRouteTable } from "@/platform/plugin-routing/types";
import AdminPage from "./admin/page";
import PortalPage from "./portal/page";
import PortalTicketPage from "./portal-ticket/page";
import TechnicianAppPage from "./technician-app/page";
import TrackPage from "./track/page";
import { GET as notificationsGET, POST as notificationsPOST } from "./api/notifications/route";
import { POST as kioskSubmitPOST } from "./api/kiosk-submit/route";
import { GET as boardFeedGET } from "./api/board-feed/route";

// admin: área administrativa (/admin/helpdesk), abas dirigidas por ?tab=.
// public: portal do solicitante logado + app do técnico + acompanhamento anônimo por tracking
// token (§2.5). `chamados` = caminho completo (helpdesk ≠ chamados, é um namespace de URL — §4).
// Ordem importa: `chamados/tecnico` e `chamados/acompanhar/:trackingToken` são literais/prefixos
// fixos e precisam vir ANTES de `chamados/:ticketRef` (`{queue.key}-{seq}`), senão "tecnico" ou
// "acompanhar" casariam como ref.
// As páginas do QUIOSQUE (`/chamados/quiosque/[token]`) e do PAINEL DE TV
// (`/chamados/painel/[token]`) NÃO entram aqui — precisam fugir da shell do (platform) (§4), então
// moram em src/app/chamados/{quiosque,painel}/[token]/ como shims de reexport, mesmo padrão de
// src/app/broadcast/out/[token].
// api: notificações in-app (sessão) + submissão anônima do quiosque + feed do painel de TV
// (§2.6, token, sem sessão) — despachadas por src/app/api/[plugin]/…, que já declara
// `dynamic = "force-dynamic"`.
export const helpdeskRouteTable: PluginRouteTable = {
  admin: [{ pattern: "", Component: asPluginPage(AdminPage) }],
  public: [
    { pattern: "chamados", Component: asPluginPage(PortalPage) },
    { pattern: "chamados/tecnico", Component: asPluginPage(TechnicianAppPage) },
    { pattern: "chamados/acompanhar/:trackingToken", Component: asPluginPage(TrackPage) },
    { pattern: "chamados/:ticketRef", Component: asPluginPage(PortalTicketPage) },
  ],
  api: [
    {
      pattern: "notifications",
      handlers: {
        GET: asPluginApiHandler(notificationsGET),
        POST: asPluginApiHandler(notificationsPOST),
      },
    },
    {
      pattern: "kiosk/:token",
      handlers: { POST: asPluginApiHandler(kioskSubmitPOST) },
    },
    {
      pattern: "board/:token",
      handlers: { GET: asPluginApiHandler(boardFeedGET) },
    },
  ],
};
