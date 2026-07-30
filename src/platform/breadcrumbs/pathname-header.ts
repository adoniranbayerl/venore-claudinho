// Compartilhado entre src/proxy.ts (quem escreve) e resolve-breadcrumbs.ts (quem lê) — mesmo par
// que docs/proxy.md chama de "Setting Headers" / "Using cookies": um nome de header numa constante
// só, nunca uma string literal duplicada nos dois lados.
export const BREADCRUMB_PATHNAME_HEADER = "x-breadcrumb-pathname";
