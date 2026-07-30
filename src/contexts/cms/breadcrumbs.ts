import { cache } from "react";
import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";
import { staticBreadcrumbSegment, dynamicBreadcrumbSegment } from "@/platform/breadcrumbs/define-segment";
import { getEntryHandler } from "./features/entries/get-entry/handler";
import { getMenuTreeHandler } from "./features/menus/get-menu-tree/handler";

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

export const cmsBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "cms.overview", segments: ["admin", "cms"], label: "CMS" }),
  staticBreadcrumbSegment({
    key: "cms.content-types",
    segments: ["admin", "cms", "content-types"],
    label: "Tipos de conteúdo",
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
];
