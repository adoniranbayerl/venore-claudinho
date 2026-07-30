import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";
import { staticBreadcrumbSegment } from "@/platform/breadcrumbs/define-segment";

export const birthdaysBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "birthdays.public", segments: ["birthdays"], label: "Aniversariantes" }),
  staticBreadcrumbSegment({ key: "birthdays.admin", segments: ["admin", "birthdays"], label: "Aniversariantes" }),
  staticBreadcrumbSegment({
    key: "birthdays.admin.appearance",
    segments: ["admin", "birthdays", "appearance"],
    label: "Aparência",
  }),
];
