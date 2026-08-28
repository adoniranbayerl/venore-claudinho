import type { BreadcrumbItem } from "@/contexts/themes";

export type { BreadcrumbItem };

// Saída completa de resolveBreadcrumbs() — `items` é o que a UI renderiza (href null no item
// atual, docs do pedido); `jsonLd` é o objeto BreadcrumbList pronto (schema.org exige URL absoluta
// por item, inclusive o atual, então essa versão guarda o href real de todo mundo). O tema só
// serializa `jsonLd` num <script>, nunca monta o objeto sozinho (Contrato de slot).
export type ResolvedBreadcrumbs = {
  items: BreadcrumbItem[];
  jsonLd: Record<string, unknown> | null;
};

// Retornado pelo `resolve` de um segmento que é um WILDCARD POSICIONAL (ex: cms ":slug" e
// ":categorySlug/:entrySlug") — ele casa com QUALQUER rota pública daquela profundidade, mas ao
// resolver descobre que o caminho não é dele (nenhuma categoria/entry com esse slug: rota de
// plugin, 404, ou plugin desativado com o caminho reservado). Diferente de `null`, isto NÃO gera
// o aviso de "rótulo não resolvido" em dev: não é um registro com rótulo faltando, é um caminho
// de outro dono. Nos dois casos o segmento é omitido da trilha.
// Singleton comparado por identidade (`resolve(...) === BREADCRUMB_SEGMENT_NOT_OWNED`). `unique
// symbol` porque só ele estreita o union no `===` de resolve-breadcrumbs.ts — um objeto sentinela
// não sairia do union e obrigaria a um cast. Atenção ao devolvê-lo de um `async () =>` sem tipo de
// contexto: o symbol widen pra `symbol`; devolva de função síncrona ou com o retorno anotado.
export const BREADCRUMB_SEGMENT_NOT_OWNED: unique symbol = Symbol("breadcrumb.segment.not-owned");

// Rótulo resolvido de UM nível da trilha. null = "sem rótulo pra esse segmento" — decisão de
// produto registrada em resolve-breadcrumbs.ts: o segmento é omitido da trilha (nunca vira texto
// cru tipo o slug/id bruto na tela). BREADCRUMB_SEGMENT_NOT_OWNED = omitido também, mas sem aviso.
export type BreadcrumbResolvedLabel =
  | { label: string; href: string | null }
  | typeof BREADCRUMB_SEGMENT_NOT_OWNED
  | null;

// Cada nível de rota é dono de UM registro (contexts/plugins declaram os próprios, mesmo modelo de
// AdminNavItemDefinition — platform/admin-shell/admin-navigation.contracts.ts). `segments` é o
// caminho absoluto até esse nível, tokenizado: literal ("admin", "cms") ou parâmetro dinâmico
// (":id", ":courseSlug"). Dois registros não podem declarar o mesmo template (checado em
// registry.ts, mesmo espírito de assertUniqueNavigationKeys).
export type BreadcrumbSegmentDefinition = {
  // Só para mensagem de erro/log — nunca aparece na UI.
  key: string;
  segments: string[];
  // Estático: função síncrona, sem I/O — custo zero (retorna o literal direto). Dinâmico: função
  // assíncrona que resolve a entidade pelo valor do parâmetro — nunca uma consulta genérica ao
  // banco disparada pelo próprio breadcrumb, sempre a função de resolução declarada aqui junto do
  // segmento (docs do pedido: "por uma função de resolução declarada junto com o segmento").
  resolve: (params: Readonly<Record<string, string>>) => BreadcrumbResolvedLabel | Promise<BreadcrumbResolvedLabel>;
};
