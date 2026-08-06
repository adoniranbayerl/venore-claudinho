import { cache } from "react";
import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";
import { staticBreadcrumbSegment, dynamicBreadcrumbSegment } from "@/platform/breadcrumbs/define-segment";
import { getEntryHandler } from "./features/entries/get-entry/handler";
import { getMenuTreeHandler } from "./features/menus/get-menu-tree/handler";
import { getCategoryBySlugHandler } from "./features/categories/get-category-by-slug/handler";
import { getPublishedEntryBySlugHandler } from "./features/entries/get-published-entry-by-slug/handler";

// cache() do React só dedupe por IGUALDADE DE REFERÊNCIA quando o argumento é objeto (WeakMap
// internamente — node_modules/react/cjs/react.react-server.development.js, exports.cache). Os
// handlers do context recebem `{ id }`/`{ menuId }` (objeto novo a cada call site), então embrulhar
// o handler direto em cache() NÃO dedupava nada. Por isso os wrappers abaixo recebem o id como
// STRING (primitivo — comparado por valor, não por referência): toda página que precisa do mesmo
// entry/menu no mesmo request chama a MESMA função com o MESMO id e ganha uma única query, mesmo
// sem saber que o breadcrumb também precisou dele (ou vice-versa). Reexportados por ./index.ts pra
// as páginas do CMS chamarem em vez do handler cru — é a garantia de reuso pedida, não só uma
// intenção documentada.
export const getCachedEntry = cache((id: string) => getEntryHandler({ id }));
export const getCachedMenuTree = cache((menuId: string) => getMenuTreeHandler({ menuId }));
// Mesmo raciocínio, agora pras rotas públicas: app/(platform)/[...slug]/page.tsx resolve
// categoria/entry pra montar a página, e o breadcrumb precisa exatamente do mesmo par
// categoria+entry pra montar a trilha — cache() garante que os dois usam a MESMA query no
// request, sem precisar coordenar entre si (mesmo comentário do bloco acima).
export const getCachedCategoryBySlug = cache((slug: string) => getCategoryBySlugHandler({ slug }));
export const getCachedPublishedEntryBySlug = cache((categoryId: string | null, slug: string) =>
  getPublishedEntryBySlugHandler({ categoryId, slug }),
);

export const cmsBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "cms.overview", segments: ["admin", "cms"], label: "Editorial" }),
  staticBreadcrumbSegment({
    key: "cms.content-types",
    segments: ["admin", "cms", "content-types"],
    label: "Tags",
  }),
  staticBreadcrumbSegment({ key: "cms.categories", segments: ["admin", "cms", "categories"], label: "Categorias" }),
  staticBreadcrumbSegment({ key: "cms.entries", segments: ["admin", "cms", "entries"], label: "Conteúdos" }),
  staticBreadcrumbSegment({
    key: "cms.entries.new",
    segments: ["admin", "cms", "entries", "new"],
    label: "Novo conteúdo",
    href: null,
  }),
  dynamicBreadcrumbSegment({
    key: "cms.entries.detail",
    segments: ["admin", "cms", "entries", ":id"],
    paramName: "id",
    resolveLabel: async (id) => {
      const result = await getCachedEntry(id);
      return result.success && result.data ? result.data.title : null;
    },
  }),
  staticBreadcrumbSegment({
    key: "cms.entries.builder",
    segments: ["admin", "cms", "entries", ":id", "builder"],
    label: "Builder",
    href: null,
  }),
  staticBreadcrumbSegment({ key: "cms.menus", segments: ["admin", "cms", "menus"], label: "Navegação" }),
  dynamicBreadcrumbSegment({
    key: "cms.menus.detail",
    segments: ["admin", "cms", "menus", ":menuId"],
    paramName: "menuId",
    resolveLabel: async (menuId) => {
      const result = await getCachedMenuTree(menuId);
      return result.success ? result.data.menu.name : null;
    },
  }),

  // --- Público — app/(platform)/[...slug]/page.tsx ---
  // Nível 1: pode ser uma categoria (blogroll) OU uma entry solta na raiz (categoryId null) —
  // mesma ordem de resolução da própria página (categoria tem precedência). Sem colisão com
  // "academy"/"birthdays"/"donations"/etc. registrados noutros contexts/plugins: match-segments.ts
  // sempre prefere o literal específico a este wildcard, não importa a ordem de registro aqui.
  dynamicBreadcrumbSegment({
    key: "cms.public.category-or-entry",
    segments: [":slug"],
    paramName: "slug",
    resolveLabel: async (slug) => {
      const categoryResult = await getCachedCategoryBySlug(slug);
      if (categoryResult.success && categoryResult.data) return categoryResult.data.name;

      const entryResult = await getCachedPublishedEntryBySlug(null, slug);
      return entryResult.success && entryResult.data ? entryResult.data.title : null;
    },
  }),
  // Nível 2: entry dentro de categoria (/<categoria>/<entry>) — precisa dos dois parâmetros pra
  // resolver o id da categoria antes de buscar a entry, por isso usa o BreadcrumbSegmentDefinition
  // cru em vez do helper dynamicBreadcrumbSegment (que só expõe um paramName por segmento).
  {
    key: "cms.public.entry-in-category",
    segments: [":categorySlug", ":entrySlug"],
    resolve: async (params) => {
      const categoryResult = await getCachedCategoryBySlug(params.categorySlug);
      if (!categoryResult.success || !categoryResult.data) return null;

      const entryResult = await getCachedPublishedEntryBySlug(categoryResult.data.id, params.entrySlug);
      if (!entryResult.success || !entryResult.data) return null;

      return { label: entryResult.data.title, href: `/${params.categorySlug}/${params.entrySlug}` };
    },
  },
];
