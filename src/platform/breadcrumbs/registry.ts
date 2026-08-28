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
import { getActivePluginKeys } from "@/platform/plugin-engine/get-active-plugin-keys";

// Segmentos que SEMPRE valem — core (platform + contexts). Nenhum depende de plugin.
const CORE_BREADCRUMB_SEGMENTS: BreadcrumbSegmentDefinition[] = [
  ...platformBreadcrumbSegments,
  ...rbacBreadcrumbSegments,
  ...cmsBreadcrumbSegments,
  ...mediaBreadcrumbSegments,
  ...settingsBreadcrumbSegments,
  ...themesBreadcrumbSegments,
  ...observabilityBreadcrumbSegments,
];

// Segmentos por plugin, chaveados pela mesma `key` do manifesto — só entram na trilha quando o
// plugin está ativo (mesmo padrão de PLUGIN_BLOCK_BARRELS). Um plugin desativado tem o caminho
// "reservado" (o catch-all do CMS devolve notFound pra ele, ver AGENTS.md 1.1), então não faz
// sentido resolver rótulo de breadcrumb pra uma rota que não renderiza.
const PLUGIN_BREADCRUMB_SEGMENTS: Record<string, BreadcrumbSegmentDefinition[]> = {
  academy: academyBreadcrumbSegments,
  birthdays: birthdaysBreadcrumbSegments,
  donations: donationsBreadcrumbSegments,
};

// Registro de breadcrumbs (mesmo padrão de platform/admin-shell/admin-navigation-registry.ts):
// cada context/plugin declara os próprios segmentos num breadcrumbs.ts, reexportado pelo barrel
// público; esta função só agrega, filtra por plugin ativo, valida template único e devolve a
// lista plana. Nenhuma página declara a própria trilha — só o módulo-fonte do context/plugin
// dono daquele nível de rota.
export const collectBreadcrumbSegments = cache(async (): Promise<BreadcrumbSegmentDefinition[]> => {
  const activePluginKeys = await getActivePluginKeys();
  const segments: BreadcrumbSegmentDefinition[] = [
    ...CORE_BREADCRUMB_SEGMENTS,
    ...Object.entries(PLUGIN_BREADCRUMB_SEGMENTS)
      .filter(([pluginKey]) => activePluginKeys.has(pluginKey))
      .flatMap(([, pluginSegments]) => pluginSegments),
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
