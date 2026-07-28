import { getCurrentUser } from "@/contexts/auth";
import { getMenuByLocation } from "@/contexts/cms";
import { venoreSlimeMockProps } from "@/themes/venore-slime/mock-data";
import type { HeaderSlotProps, HeaderUserInfo, FooterSlotProps, SidebarLeftSlotProps, NavMode, NavItem } from "@/contexts/themes";

// TODO: substituir brand/footer/header-nav/sitemap por composição real de contexts/cms +
// contexts/rbac quando esses contexts existirem. Até lá, este é o ÚNICO lugar do sistema onde
// dado mockado vira prop de slot — nunca dentro do próprio tema. navMode/navItems/
// canToggleAdminNav já são resolvidos de verdade (platform/nav-mode + platform/admin-shell),
// passados pelo layout e mesclados no SidebarLeft (main-nav/admin-nav não vivem no Header). O
// dado de usuário do Header (user/canAccessAdmin/onSignOut) segue o mesmo princípio: resolvido
// aqui a partir de @/contexts/auth, nunca dentro do próprio tema. main-nav agora vem de
// contexts/cms (menu "main-nav") em vez do mock; se a leitura falhar, caímos de volta no mock
// fixo em venoreSlimeMockProps.sidebarLeft.navItems para nunca deixar a sidebar vazia.
export async function resolveThemeSlotProps(sidebarNav: {
  navMode: NavMode;
  adminNavItems: NavItem[];
  canToggleAdminNav: boolean;
  onToggleNavMode: () => Promise<void>;
  canAccessAdmin: boolean;
  onSignOut: () => Promise<void>;
}): Promise<{
  header: HeaderSlotProps;
  footer: FooterSlotProps;
  sidebarLeft: SidebarLeftSlotProps;
}> {
  const currentUser = await getCurrentUser();
  const user: HeaderUserInfo | null =
    currentUser.success && currentUser.data
      ? {
          displayName: currentUser.data.name ?? currentUser.data.email ?? "Usuário",
          email: currentUser.data.email,
          imageUrl: currentUser.data.image,
        }
      : null;

  const mainMenu = await getMenuByLocation({ location: "main-nav" });
  const mainNavItems: NavItem[] = mainMenu.success
    ? mainMenu.data.items.map((item) => ({ key: item.id, label: item.label, href: item.href }))
    : venoreSlimeMockProps.sidebarLeft.navItems;

  return {
    ...venoreSlimeMockProps,
    header: {
      ...venoreSlimeMockProps.header,
      user,
      canAccessAdmin: sidebarNav.canAccessAdmin,
      onSignOut: sidebarNav.onSignOut,
    },
    sidebarLeft: {
      enabled: venoreSlimeMockProps.sidebarLeft.enabled,
      navMode: sidebarNav.navMode,
      navItems: sidebarNav.navMode === "admin" ? sidebarNav.adminNavItems : mainNavItems,
      canToggleAdminNav: sidebarNav.canToggleAdminNav,
      onToggleNavMode: sidebarNav.onToggleNavMode,
    },
  };
}
