import type { HeaderSlotProps, FooterSlotProps, SidebarRightSlotProps, NavItem } from "@/contexts/themes";

// Dado mockado do tema Venore Slime — não existe CMS nem RBAC de navegação ainda para resolver
// brand/navItems/sitemap de verdade (docs/venore-docks.md — "Sobre temas", ponto 6).
//
// IMPORTANTE: nenhum componente de slot deste tema importa este módulo. Só a camada de
// composição em platform/theme-rendering/resolve-theme-slot-props.ts pode importá-lo e passar
// os valores como props — um tema nunca busca dado sozinho (Contrato de slot).
//
// header aqui é o HeaderSlotProps completo (brand/userbar/header-nav/scrollState não têm fonte
// real ainda). sidebarRight só cobre enabled + a lista main-nav (usada quando navMode === "main")
// — navMode/canToggleAdminNav/onToggleNavMode/admin-nav são resolvidos de verdade pelo layout e
// mesclados por cima em resolve-theme-slot-props.ts.
export const venoreSlimeMockProps: {
  header: HeaderSlotProps;
  footer: FooterSlotProps;
  sidebarRight: Omit<SidebarRightSlotProps, "navMode" | "canToggleAdminNav" | "onToggleNavMode"> & {
    navItems: NavItem[];
  };
} = {
  header: {
    brand: { name: "Venore Docks" },
    userbarEnabled: true,
    headerNavItems: [],
    scrollState: { isScrolled: false },
  },
  footer: {
    brand: { name: "Venore Docks" },
    sitemapItems: [],
    creditsEnabled: true,
  },
  sidebarRight: { enabled: true, navItems: [{ key: "home", label: "Home", href: "/" }] },
};
