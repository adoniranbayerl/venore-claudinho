import { getCurrentUser } from "@/contexts/auth";
import { getMenuByLocation } from "@/contexts/cms";
import { getMedia } from "@/contexts/media";
import { getBrandConfig } from "@/platform/brand/get-brand-config";
import { venoreSlimeMockProps } from "@/themes/venore-slime/mock-data";
import type { HeaderSlotProps, HeaderUserInfo, FooterSlotProps, SidebarLeftSlotProps, NavMode, NavItem, NavGroup } from "@/contexts/themes";

// TODO: substituir footer/header-nav/sitemap por composição real de contexts/cms + contexts/rbac
// quando esses contexts existirem. Até lá, este é o ÚNICO lugar do sistema onde dado mockado vira
// prop de slot — nunca dentro do próprio tema. navMode/navItems/canToggleAdminNav já são
// resolvidos de verdade (platform/nav-mode + platform/admin-shell), passados pelo layout e
// mesclados no SidebarLeft (main-nav/admin-nav não vivem no Header). O dado de usuário do Header
// (user/canAccessAdmin/onSignOut) segue o mesmo princípio: resolvido aqui a partir de
// @/contexts/auth, nunca dentro do próprio tema. main-nav agora vem de contexts/cms (menu
// "main-nav") em vez do mock; se a leitura falhar, caímos de volta no mock fixo em
// venoreSlimeMockProps.sidebarLeft.navItems para nunca deixar a sidebar vazia. header.brand vem
// de contexts/settings (getBrandConfig) — não é mais mock, sobrevive a troca de tema.
export async function resolveThemeSlotProps(sidebarNav: {
  navMode: NavMode;
  adminNavGroups: NavGroup[];
  canToggleAdminNav: boolean;
  onToggleNavMode: () => Promise<void>;
  canAccessAdmin: boolean;
  onSignOut: () => Promise<void>;
  collapsed: boolean;
  onToggleCollapsed: () => Promise<void>;
}): Promise<{
  header: HeaderSlotProps;
  footer: FooterSlotProps;
  sidebarLeft: SidebarLeftSlotProps;
}> {
  const currentUser = await getCurrentUser();
  let avatarUrl: string | null = null;
  if (currentUser.success && currentUser.data) {
    // avatarMediaId (escolhido via seletor de mídia) tem prioridade sobre `image` (populado pelo
    // provider OAuth) — mesmo princípio de "tema nunca busca dado sozinho": a resolução mediaId→url
    // acontece aqui, na composição, não dentro do tema.
    const avatarMedia = currentUser.data.avatarMediaId ? await getMedia({ id: currentUser.data.avatarMediaId }) : null;
    avatarUrl = avatarMedia?.success ? (avatarMedia.data?.url ?? currentUser.data.image) : currentUser.data.image;
  }
  const user: HeaderUserInfo | null =
    currentUser.success && currentUser.data
      ? {
          displayName: currentUser.data.name ?? currentUser.data.email ?? "Usuário",
          email: currentUser.data.email,
          imageUrl: avatarUrl,
        }
      : null;

  const mainMenu = await getMenuByLocation({ location: "main-nav" });
  const mainNavItems: NavItem[] = mainMenu.success
    ? mainMenu.data.items.map((item) => ({ key: item.id, label: item.label, href: item.href }))
    : venoreSlimeMockProps.sidebarLeft.navItems;

  const brandConfig = await getBrandConfig();

  return {
    ...venoreSlimeMockProps,
    header: {
      ...venoreSlimeMockProps.header,
      brand: {
        name: brandConfig.siteName,
        mode: brandConfig.mode,
        size: brandConfig.size,
        scrolledSize: brandConfig.scrolledSize,
        position: brandConfig.position,
        logoUrl: brandConfig.logoUrl,
        scrolledLogoUrl: brandConfig.scrolledLogoUrl,
      },
      user,
      canAccessAdmin: sidebarNav.canAccessAdmin,
      onSignOut: sidebarNav.onSignOut,
    },
    sidebarLeft: {
      enabled: venoreSlimeMockProps.sidebarLeft.enabled,
      navMode: sidebarNav.navMode,
      navItems: sidebarNav.navMode === "admin" ? [] : mainNavItems,
      navGroups: sidebarNav.navMode === "admin" ? sidebarNav.adminNavGroups : [],
      canToggleAdminNav: sidebarNav.canToggleAdminNav,
      onToggleNavMode: sidebarNav.onToggleNavMode,
      collapsed: sidebarNav.collapsed,
      onToggleCollapsed: sidebarNav.onToggleCollapsed,
    },
  };
}
