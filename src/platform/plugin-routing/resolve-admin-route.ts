import { PLUGIN_ROUTE_TABLES } from "@/plugins/route-registry";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { matchPluginRoutes } from "./match-route";
import type { PluginPageComponent, PluginRouteParams } from "./types";

export type ResolvedPluginPageRoute = { Component: PluginPageComponent; params: PluginRouteParams };

// Consumido por src/app/(platform)/admin/[plugin]/[[...slug]]/page.tsx — único ponto do Next.js
// que resolve rota admin de plugin; nenhuma pasta por plugin existe mais em app/admin/**.
export async function resolveAdminPluginRoute(plugin: string, slug: string[]): Promise<ResolvedPluginPageRoute | null> {
  const table = PLUGIN_ROUTE_TABLES[plugin]?.admin;
  if (!table || !(await isPluginActive(plugin))) {
    return null;
  }

  const matched = matchPluginRoutes(table, slug);
  if (!matched) {
    return null;
  }

  return { Component: matched.route.Component, params: matched.params };
}
