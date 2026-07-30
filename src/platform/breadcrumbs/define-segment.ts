import type { BreadcrumbResolvedLabel, BreadcrumbSegmentDefinition } from "./types";

function buildHref(segments: string[], params: Readonly<Record<string, string>>): string {
  const path = segments.map((token) => (token.startsWith(":") ? params[token.slice(1)] : token)).join("/");
  return `/${path}`;
}

// Segmento estático — rótulo fixo, sem I/O algum (docs do pedido: "os rótulos estáticos vêm do
// registro, custo zero"). `href: null` declara explicitamente um nível sem página própria (ex:
// "admin/cms/entries/new" — clicável não faria sentido, não existe view de "voltar pra si mesmo").
export function staticBreadcrumbSegment(input: {
  key: string;
  segments: string[];
  label: string;
  href?: string | null;
}): BreadcrumbSegmentDefinition {
  return {
    key: input.key,
    segments: input.segments,
    resolve: (params) => ({
      label: input.label,
      href: input.href === undefined ? buildHref(input.segments, params) : input.href,
    }),
  };
}

// Segmento dinâmico — o rótulo vem da própria entidade (curso, aula, entry, menu), nunca de uma
// consulta genérica disparada pelo breadcrumb: `resolveLabel` é a função que o context/plugin dono
// do segmento declara, normalmente reaproveitando o mesmo loader cacheado (`cache()` do React) que
// a página já usa — ver comentário em cada breadcrumbs.ts de context/plugin. Retornar `null` marca
// "não resolveu" (entidade não encontrada, etc.) e o resolver (resolve-breadcrumbs.ts) omite o
// segmento da trilha em vez de mostrar o parâmetro cru.
export function dynamicBreadcrumbSegment(input: {
  key: string;
  segments: string[];
  paramName: string;
  resolveLabel: (paramValue: string) => Promise<string | null> | string | null;
  href?: (paramValue: string) => string | null;
}): BreadcrumbSegmentDefinition {
  return {
    key: input.key,
    segments: input.segments,
    resolve: async (params): Promise<BreadcrumbResolvedLabel> => {
      const paramValue = params[input.paramName];
      const label = await input.resolveLabel(paramValue);
      if (label === null) return null;
      return { label, href: input.href ? input.href(paramValue) : buildHref(input.segments, params) };
    },
  };
}
