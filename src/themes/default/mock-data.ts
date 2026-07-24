import type { HeaderSlotProps, FooterSlotProps, SidebarRightSlotProps } from "@/contexts/themes";

// Dado mockado do tema default — não existe CMS nem RBAC de navegação ainda para resolver
// brand/navItems/sitemap de verdade (docs/venore-docks.md — "Sobre temas", ponto 6).
//
// IMPORTANTE: nenhum componente de slot deste tema importa este módulo. Só a camada de
// composição em platform/theme-rendering/resolve-theme-slot-props.ts pode importá-lo e passar
// os valores como props — um tema nunca busca dado sozinho (Contrato de slot).
export const defaultThemeMockProps: {
  header: HeaderSlotProps;
  footer: FooterSlotProps;
  sidebarRight: SidebarRightSlotProps;
} = {
  header: {
    brand: { name: "Venore Docks" },
    userbarEnabled: true,
    navItems: [{ key: "home", label: "Home", href: "/" }],
    scrollState: { isScrolled: false },
  },
  footer: {
    brand: { name: "Venore Docks" },
    sitemapItems: [],
    creditsEnabled: true,
  },
  sidebarRight: { enabled: false, blocks: [] },
};
