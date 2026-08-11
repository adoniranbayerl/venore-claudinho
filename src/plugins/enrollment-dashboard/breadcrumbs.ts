import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";
import { staticBreadcrumbSegment } from "@/platform/breadcrumbs/define-segment";

export const enrollmentDashboardBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({
    key: "enrollment-dashboard.admin",
    segments: ["admin", "enrollment-dashboard"],
    label: "Matrículas",
  }),
];
