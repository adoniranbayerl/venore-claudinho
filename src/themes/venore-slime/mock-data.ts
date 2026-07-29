import type { HeaderSlotProps, FooterSlotProps, SidebarLeftSlotProps, NavItem } from "@/contexts/themes";

// Dado mockado do tema Venore Slime — não existe CMS nem RBAC de navegação ainda para resolver
// brand/navItems/sitemap de verdade (docs/venore-docks.md — "Sobre temas", ponto 6).
//
// IMPORTANTE: nenhum componente de slot deste tema importa este módulo. Só a camada de
// composição em platform/theme-rendering/resolve-theme-slot-props.ts pode importá-lo e passar
// os valores como props — um tema nunca busca dado sozinho (Contrato de slot).
//
// header aqui cobre brand/userbar/header-nav/scrollState (sem fonte real ainda). user/
// canAccessAdmin/onSignOut vêm de @/contexts/auth via resolve-theme-slot-props.ts, nunca do
// mock. sidebarLeft só cobre enabled + a lista main-nav (usada quando navMode === "main") —
// navMode/canToggleAdminNav/onToggleNavMode/admin-nav são resolvidos de verdade pelo layout e
// mesclados por cima em resolve-theme-slot-props.ts.
export const venoreSlimeMockProps: {
  header: Omit<HeaderSlotProps, "user" | "canAccessAdmin" | "onSignOut">;
  footer: FooterSlotProps;
  sidebarLeft: Omit<SidebarLeftSlotProps, "navMode" | "canToggleAdminNav" | "onToggleNavMode"> & {
    navItems: NavItem[];
  };
} = {
  header: {
    // Sobrescrito de verdade por getBrandConfig() em resolve-theme-slot-props.ts — valor aqui
    // só existe pra este objeto tipar como HeaderSlotProps completo.
    brand: {
      name: "Venore Docks",
      mode: "svg",
      size: 100,
      scrolledSize: 80,
      position: "left",
      logoUrl: "/brand/brand-logo.svg",
      scrolledLogoUrl: "/brand/brand-logo-scrolled.png",
    },
    userbarEnabled: true,
    headerNavItems: [],
    scrollState: { isScrolled: false },
  },
  footer: {
    brand: { name: "Venore Docks" },
    sitemapItems: [],
    creditsEnabled: true,
  },
  sidebarLeft: { enabled: true, navItems: [{ key: "home", label: "Home", href: "/" }] },
};
