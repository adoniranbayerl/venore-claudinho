import { cache } from "react";
import type { BreadcrumbSegmentDefinition } from "./types";
import { platformBreadcrumbSegments } from "./platform-static-segments";
import { cmsBreadcrumbSegments } from "@/contexts/cms";
import { rbacBreadcrumbSegments } from "@/contexts/rbac";
import { mediaBreadcrumbSegments } from "@/contexts/media";
import { settingsBreadcrumbSegments } from "@/contexts/settings";
import { themesBreadcrumbSegments } from "@/contexts/themes";
import { observabilityBreadcrumbSegments } from "@/observability";
import { academyBreadcrumbSegments } from "@/plugins/academy";
import { birthdaysBreadcrumbSegments } from "@/plugins/birthdays";
import { donationsBreadcrumbSegments } from "@/plugins/donations";

// Registro de breadcrumbs (mesmo padrão de platform/admin-shell/admin-navigation-registry.ts):
// cada context/plugin declara os próprios segmentos num breadcrumbs.ts, reexportado pelo barrel
// público; esta função só agrega, valida template único e devolve a lista plana. Nenhuma página
// declara a própria trilha — só o módulo-fonte do context/plugin dono daquele nível de rota.
export const collectBreadcrumbSegments = cache(async (): Promise<BreadcrumbSegmentDefinition[]> => {
  const segments: BreadcrumbSegmentDefinition[] = [
    ...platformBreadcrumbSegments,
    ...rbacBreadcrumbSegments,
    ...cmsBreadcrumbSegments,
    ...mediaBreadcrumbSegments,
    ...settingsBreadcrumbSegments,
    ...themesBreadcrumbSegments,
    ...observabilityBreadcrumbSegments,
    ...academyBreadcrumbSegments,
    ...birthdaysBreadcrumbSegments,
    ...donationsBreadcrumbSegments,
  ];
  assertUniqueBreadcrumbTemplates(segments);
  return segments;
});

export function assertUniqueBreadcrumbTemplates(segments: BreadcrumbSegmentDefinition[]): void {
  const ownerByTemplate = new Map<string, string>();
  for (const segment of segments) {
    const template = `/${segment.segments.join("/")}`;
    const owner = ownerByTemplate.get(template);
    if (owner) {
      throw new Error(
        `Breadcrumb: rota "${template}" já registrada por "${owner}" — "${segment.key}" colide com ela. Cada nível de rota só pode ter um dono.`,
      );
    }
    ownerByTemplate.set(template, segment.key);
  }
}
