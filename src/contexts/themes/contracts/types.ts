import type { ReactNode } from "react";

export type ThemeManifest = {
  key: string; // kebab-case, único, estável — mesmo padrão de PluginManifest.key
  name: string;
  version: string;
  themeContractVersion: string; // versão do contrato que o tema foi construído contra
};

export type ActiveThemeState = {
  themeKey: string;
  activatedAt: Date | null; // null = nunca ativado explicitamente, rodando no fallback
};

// --- Contrato de slot (docs/venore-docks.md — "Sobre temas" / Contrato de slot), verbatim ---

export type NavItem = { key: string; label: string; href: string };
export type SitemapItem = { key: string; label: string; href: string };
export type ScrollState = { isScrolled: boolean };

export type NavMode = "main" | "admin";

export type HeaderSlotProps = {
  brand: { name: string; logoUrl?: string };
  userbarEnabled: boolean;
  // header-nav: navegação própria do Header, distinta de main-nav/admin-nav (que vivem no
  // SidebarRight) — opcional, lista vazia = tema não renderiza nada aqui.
  headerNavItems: NavItem[];
  scrollState: ScrollState;
};

export type FooterSlotProps = {
  brand: { name: string; logoUrl?: string };
  sitemapItems: SitemapItem[];
  creditsEnabled: boolean;
};

export type ContentSlotProps = {
  children: ReactNode;
  sidebarContextualEnabled: boolean;
};

// SidebarRight é exclusivo de navegação (main-nav ou admin-nav, conforme navMode) — não é área
// de widgets. O controle de alternância main-nav/admin-nav também mora aqui, não no Header.
export type SidebarRightSlotProps = {
  enabled: boolean;
  navMode: NavMode;
  navItems: NavItem[];
  canToggleAdminNav: boolean;
  onToggleNavMode: () => Promise<void>;
};
