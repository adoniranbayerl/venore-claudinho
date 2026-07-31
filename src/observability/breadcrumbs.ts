import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";
import { staticBreadcrumbSegment } from "@/platform/breadcrumbs/define-segment";

export const observabilityBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "observability.diagnostics", segments: ["admin", "diagnostics"], label: "Diagnostics" }),
  staticBreadcrumbSegment({
    key: "observability.diagnostics.audit",
    segments: ["admin", "diagnostics", "audit"],
    label: "Auditoria de segurança",
  }),
];
