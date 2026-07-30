import { resolveActiveTheme } from "@/platform/theme-rendering/resolve-active-theme";
import { resolveThemeSlotProps } from "@/platform/theme-rendering/resolve-theme-slot-props";
import { resolveBreadcrumbs } from "@/platform/breadcrumbs/resolve-breadcrumbs";
import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";
import { getVisibleAdminNavGroupsForSidebar } from "@/platform/admin-shell/admin-navigation-registry";
import { getNavMode } from "@/platform/nav-mode/get-nav-mode";
import { toggleNavModeAction } from "@/platform/nav-mode/toggle-nav-mode-action";
import { getSidebarCollapsed } from "@/platform/sidebar-collapse/get-sidebar-collapsed";
import { toggleSidebarCollapsedAction } from "@/platform/sidebar-collapse/toggle-sidebar-collapsed-action";
import { signOutAction } from "@/app/(auth)/actions";
import type { NavGroup } from "@/contexts/themes";

// Shell única (docs/venore-docks.md — "Shell única — sem área admin separada"): o `Shell` do
// tema ativo é montado uma única vez aqui, pra toda página pública, academy e admin — não existe
// mais um layout de admin à parte com casca própria. Este arquivo só resolve dados (gate, nav
// mode, cookies) e repassa pro `Shell`; a árvore/arranjo entre header/footer/sidebar/conteúdo é
// decisão do tema, não deste layout (docs/themes/shell-contract.md — Abordagem A).
export const dynamic = "force-dynamic";

export default async function PlatformLayout({
  children,
  sidebarContextual,
}: {
  children: React.ReactNode;
  // Slot paralelo @sidebarContextual (Next.js parallel routes) — só as rotas que definem um
  // page.tsx dentro de app/(platform)/@sidebarContextual/<segmento> preenchem isso; as demais
  // caem no default.tsx do slot, que devolve null (item 5 do pedido: preencher o slot que hoje
  // é passado sempre vazio, sem tocar em handler/service/store da Academy).
  sidebarContextual: React.ReactNode;
}) {
  const { Shell } = await resolveActiveTheme();

  const breadcrumbs = await resolveBreadcrumbs();

  const adminGate = await getAdminPageData();
  const canToggleAdminNav = adminGate.granted;
  const navMode = await getNavMode(canToggleAdminNav);
  const adminNavGroups: NavGroup[] = adminGate.granted ? await getVisibleAdminNavGroupsForSidebar(adminGate.actor) : [];
  const collapsed = await getSidebarCollapsed();

  const props = await resolveThemeSlotProps({
    navMode,
    adminNavGroups,
    canToggleAdminNav,
    onToggleNavMode: toggleNavModeAction,
    canAccessAdmin: adminGate.granted,
    onSignOut: signOutAction,
    collapsed,
    onToggleCollapsed: toggleSidebarCollapsedAction,
  });

  return (
    <Shell
      header={props.header}
      footer={props.footer}
      sidebarLeft={props.sidebarLeft}
      sidebarContextualEnabled={sidebarContextual !== null}
      sidebarContextual={sidebarContextual}
      breadcrumbs={breadcrumbs.items}
      breadcrumbsJsonLd={breadcrumbs.jsonLd}
    >
      {children}
    </Shell>
  );
}
