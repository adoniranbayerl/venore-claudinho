import type { BreadcrumbSegmentDefinition } from "./types";
import { staticBreadcrumbSegment } from "./define-segment";

// Únicos níveis sem context/plugin dono (mesmo critério de platform-admin-navigation.ts: "Dashboard
// é a home do próprio admin shell, Plugins é a tela do plugin-engine"). Todo o resto vem de
// contexts/plugins, cada um no próprio breadcrumbs.ts.
export const platformBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "platform.home", segments: [], label: "Início", href: "/" }),
  staticBreadcrumbSegment({ key: "platform.account", segments: ["account"], label: "Minha conta" }),
  staticBreadcrumbSegment({ key: "platform.unauthorized", segments: ["unauthorized"], label: "Acesso não autorizado" }),
  staticBreadcrumbSegment({ key: "platform.admin.dashboard", segments: ["admin"], label: "Dashboard" }),
  staticBreadcrumbSegment({ key: "platform.admin.plugins", segments: ["admin", "plugins"], label: "Plugins" }),
];
