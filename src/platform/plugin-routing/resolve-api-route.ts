import { PLUGIN_ROUTE_TABLES } from "@/plugins/route-registry";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { matchPluginRoutes } from "./match-route";
import type { PluginApiHandler, PluginApiMethod, PluginRouteParams } from "./types";

export type ResolvedPluginApiRoute = { handler: PluginApiHandler; params: PluginRouteParams };

// Consumido por src/app/api/[plugin]/[[...slug]]/route.ts — único ponto do Next.js que resolve
// rota de API de plugin. Cada handler já faz sua própria checagem de isPluginActive (ver
// comentários nos route.ts originais: são invocáveis direto por URL, sem gate de página) — esta
// função também checa antes de despachar, pra plugin inativo dar 404 igual às outras áreas, sem
// depender de cada handler individual lembrar de checar.
export async function resolveApiPluginRoute(
  plugin: string,
  slug: string[],
  method: PluginApiMethod,
): Promise<ResolvedPluginApiRoute | null> {
  const table = PLUGIN_ROUTE_TABLES[plugin]?.api;
  if (!table || !(await isPluginActive(plugin))) {
    return null;
  }

  const matched = matchPluginRoutes(table, slug);
  if (!matched) {
    return null;
  }

  const handler = matched.route.handlers[method];
  if (!handler) {
    return null;
  }

  return { handler, params: matched.params };
}
