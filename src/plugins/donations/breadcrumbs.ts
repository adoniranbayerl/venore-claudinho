import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";
import { staticBreadcrumbSegment } from "@/platform/breadcrumbs/define-segment";

export const donationsBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "donations.public", segments: ["donations"], label: "Doações" }),
  staticBreadcrumbSegment({ key: "donations.admin", segments: ["admin", "donations"], label: "Doações" }),
];
