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
export type SidebarBlock = { key: string; type: string; data: unknown };
export type ScrollState = { isScrolled: boolean };

export type HeaderSlotProps = {
  brand: { name: string; logoUrl?: string };
  userbarEnabled: boolean;
  navItems: NavItem[];
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

export type SidebarRightSlotProps = {
  enabled: boolean;
  blocks: SidebarBlock[];
};
