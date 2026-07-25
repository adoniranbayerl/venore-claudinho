import { resolveActiveTheme } from "@/platform/theme-rendering/resolve-active-theme";
import { resolveThemeSlotProps } from "@/platform/theme-rendering/resolve-theme-slot-props";
import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";
import { getVisibleAdminNavItems } from "@/platform/admin-shell/admin-nav-groups";
import { getNavMode } from "@/platform/nav-mode/get-nav-mode";
import { toggleNavModeAction } from "@/platform/nav-mode/toggle-nav-mode-action";
import { signOutAction } from "@/app/(auth)/actions";
import type { NavItem } from "@/contexts/themes";

// Shell única (docs/venore-docks.md — "Shell única — sem área admin separada"): Header/Content/
// SidebarLeft/Footer do tema ativo montados uma única vez aqui, pra toda página pública,
// academy e admin — não existe mais um layout de admin à parte com casca própria.
export const dynamic = "force-dynamic";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { components: Slots } = await resolveActiveTheme();

  const adminGate = await getAdminPageData();
  const canToggleAdminNav = adminGate.granted;
  const navMode = await getNavMode(canToggleAdminNav);
  const adminNavItems: NavItem[] = adminGate.granted ? getVisibleAdminNavItems(adminGate.actor) : [];

  const props = await resolveThemeSlotProps({
    navMode,
    adminNavItems,
    canToggleAdminNav,
    onToggleNavMode: toggleNavModeAction,
    canAccessAdmin: adminGate.granted,
    onSignOut: signOutAction,
  });

  return (
    <>
      <Slots.Header {...props.header} />
      <div className="flex flex-1">
        <Slots.SidebarLeft {...props.sidebarLeft} />
        <Slots.Content sidebarContextualEnabled={false}>{children}</Slots.Content>
      </div>
      <Slots.Footer {...props.footer} />
    </>
  );
}
