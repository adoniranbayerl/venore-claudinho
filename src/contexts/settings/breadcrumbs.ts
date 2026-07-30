import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";
import { staticBreadcrumbSegment } from "@/platform/breadcrumbs/define-segment";

export const settingsBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "settings.general", segments: ["admin", "settings"], label: "Configurações" }),
  staticBreadcrumbSegment({
    key: "settings.appearance",
    segments: ["admin", "settings", "appearance"],
    label: "Aparência",
  }),
];
