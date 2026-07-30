import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";
import { staticBreadcrumbSegment } from "@/platform/breadcrumbs/define-segment";

export const mediaBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "media.library", segments: ["admin", "media"], label: "Mídia" }),
  staticBreadcrumbSegment({
    key: "media.upload-test",
    segments: ["admin", "media", "upload-test"],
    label: "Teste de upload",
  }),
];
