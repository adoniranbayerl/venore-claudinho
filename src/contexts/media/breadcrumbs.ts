import { cache } from "react";
import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";
import { staticBreadcrumbSegment, dynamicBreadcrumbSegment } from "@/platform/breadcrumbs/define-segment";
import { getMediaHandler } from "./features/files/get-media/handler";

// Mesmo raciocínio de contexts/cms/breadcrumbs.ts: id como string primitiva pra cache() do React
// dedupar entre a página de detalhe e o próprio breadcrumb no mesmo request.
export const getCachedMedia = cache(async (id: string) => getMediaHandler({ id }));

export const mediaBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "media.library", segments: ["admin", "media"], label: "Mídia" }),
  // Literal precisa vir ANTES do segmento dinâmico ":id" no array — matchSegments()
  // (platform/breadcrumbs/match-segments.ts) usa o primeiro definition que casar o token, e um
  // token ":id" casa qualquer valor, inclusive "upload-test" (mesma ordem de
  // contexts/cms/breadcrumbs.ts — "entries/new" antes de "entries/:id").
  staticBreadcrumbSegment({
    key: "media.upload-test",
    segments: ["admin", "media", "upload-test"],
    label: "Teste de upload",
  }),
  dynamicBreadcrumbSegment({
    key: "media.detail",
    segments: ["admin", "media", ":id"],
    paramName: "id",
    resolveLabel: async (id) => {
      const result = await getCachedMedia(id);
      return result.success && result.data ? result.data.filename : null;
    },
  }),
];
