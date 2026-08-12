import type { PluginRouteParams } from "./types";

// Matcher mínimo estilo Express/path-to-regexp — só o que as rotas de plugin precisam: segmento
// literal (compara igual) ou `:nome` (captura). Sem wildcard, sem regex por segmento, sem
// segmento opcional — nenhum use case atual precisa disso, e adicionar agora seria complexidade
// especulativa (AGENTS.md/CLAUDE.md: não construir para requisito hipotético).
export function matchRoutePattern(pattern: string, segments: string[]): PluginRouteParams | null {
  const patternSegments = pattern === "" ? [] : pattern.split("/");
  if (patternSegments.length !== segments.length) {
    return null;
  }

  const params: PluginRouteParams = {};
  for (let index = 0; index < patternSegments.length; index += 1) {
    const patternSegment = patternSegments[index];
    const actualSegment = segments[index];
    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = decodeURIComponent(actualSegment);
    } else if (patternSegment !== actualSegment) {
      return null;
    }
  }

  return params;
}

// Primeiro padrão que casar vence — mesma semântica de ordem de app/**/routes do Next.js
// (mais específico primeiro é responsabilidade de quem declara a route-table do plugin).
export function matchPluginRoutes<T extends { pattern: string }>(
  routes: T[],
  segments: string[],
): { route: T; params: PluginRouteParams } | null {
  for (const route of routes) {
    const params = matchRoutePattern(route.pattern, segments);
    if (params) {
      return { route, params };
    }
  }
  return null;
}
