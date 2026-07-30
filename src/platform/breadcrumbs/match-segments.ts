import type { BreadcrumbSegmentDefinition } from "./types";

export type BreadcrumbMatch = {
  definition: BreadcrumbSegmentDefinition;
  params: Readonly<Record<string, string>>;
};

function tokenMatches(token: string, segmentValue: string): boolean {
  return token.startsWith(":") || token === segmentValue;
}

function extractParams(definition: BreadcrumbSegmentDefinition, prefix: string[]): Record<string, string> {
  const params: Record<string, string> = {};
  definition.segments.forEach((token, index) => {
    if (token.startsWith(":")) {
      params[token.slice(1)] = prefix[index];
    }
  });
  return params;
}

// Puro — nenhum I/O, nenhum await. Custo é uma varredura em memória do registro (dezenas de
// entradas no total do app), não uma consulta por nível de rota (eficiência pedida: "os rótulos
// estáticos vêm do registro, custo zero"). A raiz ("/") é a única entrada com `segments: []` e,
// quando registrada, sempre entra primeiro — home aparece em toda página, não só na própria home.
export function matchSegments(pathnameSegments: string[], definitions: BreadcrumbSegmentDefinition[]): BreadcrumbMatch[] {
  const matches: BreadcrumbMatch[] = [];

  const root = definitions.find((definition) => definition.segments.length === 0);
  if (root) {
    matches.push({ definition: root, params: {} });
  }

  for (let level = 1; level <= pathnameSegments.length; level++) {
    const prefix = pathnameSegments.slice(0, level);
    // Nível de rota sem dono registrado: pulado, não interrompe os níveis seguintes (um segmento
    // dinâmico ainda registrado dois níveis abaixo continua casando pela própria posição/tokens,
    // independente do nível acima ter rótulo ou não).
    const definition = definitions.find((candidate) => {
      if (candidate.segments.length !== level) return false;
      return candidate.segments.every((token, index) => tokenMatches(token, prefix[index]));
    });
    if (!definition) continue;
    matches.push({ definition, params: extractParams(definition, prefix) });
  }

  return matches;
}
