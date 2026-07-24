import { venoreSlimeMockProps } from "@/themes/venore-slime/mock-data";
import type { HeaderSlotProps, FooterSlotProps, SidebarRightSlotProps, NavMode, NavItem } from "@/contexts/themes";

// TODO: substituir brand/footer/header-nav/sitemap por composição real de contexts/cms +
// contexts/rbac quando esses contexts existirem. Até lá, este é o ÚNICO lugar do sistema onde
// dado mockado vira prop de slot — nunca dentro do próprio tema. navMode/navItems/
// canToggleAdminNav já são resolvidos de verdade (platform/nav-mode + platform/admin-shell),
// passados pelo layout e mesclados no SidebarRight (main-nav/admin-nav não vivem no Header).
export function resolveThemeSlotProps(sidebarNav: {
  navMode: NavMode;
  adminNavItems: NavItem[];
  canToggleAdminNav: boolean;
  onToggleNavMode: () => Promise<void>;
}): {
  header: HeaderSlotProps;
  footer: FooterSlotProps;
  sidebarRight: SidebarRightSlotProps;
} {
  return {
    ...venoreSlimeMockProps,
    sidebarRight: {
      enabled: venoreSlimeMockProps.sidebarRight.enabled,
      navMode: sidebarNav.navMode,
      navItems:
        sidebarNav.navMode === "admin" ? sidebarNav.adminNavItems : venoreSlimeMockProps.sidebarRight.navItems,
      canToggleAdminNav: sidebarNav.canToggleAdminNav,
      onToggleNavMode: sidebarNav.onToggleNavMode,
    },
  };
}
