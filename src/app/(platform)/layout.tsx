import { resolveActiveTheme } from "@/platform/theme-rendering/resolve-active-theme";
import { resolveThemeSlotProps } from "@/platform/theme-rendering/resolve-theme-slot-props";
import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";
import { getVisibleAdminNavItems } from "@/platform/admin-shell/admin-nav-groups";
import { getNavMode } from "@/platform/nav-mode/get-nav-mode";
import { toggleNavModeAction } from "@/platform/nav-mode/toggle-nav-mode-action";
import type { NavItem } from "@/contexts/themes";

// Shell única (docs/venore-docks.md — "Shell única — sem área admin separada"): Header/Content/
// SidebarRight/Footer do tema ativo montados uma única vez aqui, pra toda página pública,
// academy e admin — não existe mais um layout de admin à parte com casca própria.
export const dynamic = "force-dynamic";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { components: Slots } = await resolveActiveTheme();

  const adminGate = await getAdminPageData();
  const canToggleAdminNav = adminGate.granted;
  const navMode = await getNavMode(canToggleAdminNav);
  const adminNavItems: NavItem[] = adminGate.granted ? getVisibleAdminNavItems(adminGate.actor) : [];

  const props = resolveThemeSlotProps({
    navMode,
    adminNavItems,
    canToggleAdminNav,
    onToggleNavMode: toggleNavModeAction,
  });

  return (
    <>
      <Slots.Header {...props.header} />
      <Slots.Content sidebarContextualEnabled={false}>{children}</Slots.Content>
      <Slots.SidebarRight {...props.sidebarRight} />
      <Slots.Footer {...props.footer} />
    </>
  );
}
