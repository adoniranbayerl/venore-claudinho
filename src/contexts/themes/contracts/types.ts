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

// icon: chave lógica resolvida pra um lucide-react dentro do tema (SidebarNavLink.tsx), nunca o
// componente em si — Server → Client Component não serializa função/componente como prop. Vem só
// de fonte que o repo controla direto (platform/admin-shell/admin-navigation-registry.ts, que
// agrega o item declarado por cada context/plugin); CMS ainda não tem coluna de ícone
// (Known Gap), então main-nav opcionalmente fica sem `icon` e cai no fallback genérico do tema.
export type NavItem = { key: string; label: string; href: string; icon?: string };
export type NavGroup = { key: string; label: string; items: NavItem[] };
export type SitemapItem = { key: string; label: string; href: string };

export type NavMode = "main" | "admin";

// Dado de usuário já resolvido para o Header — o tema nunca busca isso sozinho (Contrato de
// slot). displayName já vem com fallback (name -> email -> "Usuário") resolvido pela composição.
export type HeaderUserInfo = {
  displayName: string;
  email: string | null;
  imageUrl: string | null;
};

export type HeaderBrandMode = "text" | "svg" | "png";
export type HeaderBrandPosition = "left" | "center";

export type HeaderBrand = {
  name: string;
  mode: HeaderBrandMode;
  size: number;
  scrolledSize: number;
  position: HeaderBrandPosition;
  logoUrl: string;
  scrolledLogoUrl: string;
};

export type HeaderSlotProps = {
  // brand vem de contexts/settings (composição em resolveThemeSlotProps, não do tema) —
  // sobrevive a troca de tema, ao contrário de FooterSlotProps.brand que segue só com `name`.
  brand: HeaderBrand;
  userbarEnabled: boolean;
  // header-nav: navegação própria do Header, distinta de main-nav/admin-nav (que vivem no
  // SidebarLeft) — opcional, lista vazia = tema não renderiza nada aqui.
  headerNavItems: NavItem[];
  // user null = ninguém logado. Extensão aditiva do contrato (nenhum campo existente mudou) —
  // mantida em themeContractVersion "2.0.0" por não haver ainda segundo tema publicado
  // (docs/venore-docks.md — decisão registrada junto ao CURRENT_THEME_CONTRACT_VERSION).
  user: HeaderUserInfo | null;
  canAccessAdmin: boolean;
  onSignOut: () => Promise<void>;
};

export type FooterSlotProps = {
  brand: { name: string; logoUrl?: string };
  sitemapItems: SitemapItem[];
  creditsEnabled: boolean;
};

export type ContentSlotProps = {
  children: ReactNode;
  sidebarContextualEnabled: boolean;
  // Conteúdo já resolvido da sidebar contextual (ex: trilha de aulas da Academy), vindo do slot
  // paralelo @sidebarContextual — o tema só recebe e renderiza, nunca busca dado sozinho (Contrato
  // de slot). null quando a rota atual não tem conteúdo contextual. Extensão aditiva do contrato,
  // mesmo princípio do campo `user` em HeaderSlotProps — mantida em themeContractVersion "2.0.0"
  // por não haver ainda segundo tema publicado (docs/venore-docks.md).
  sidebarContextual: ReactNode | null;
};

// SidebarLeft é exclusivo de navegação (main-nav ou admin-nav, conforme navMode) — não é área
// de widgets. O controle de alternância main-nav/admin-nav também mora aqui, não no Header.
export type SidebarLeftSlotProps = {
  enabled: boolean;
  navMode: NavMode;
  // main-nav é uma lista plana (sem títulos de seção, protótipo confirma). admin-nav agrupa por
  // seção com título (docs/ui/shell-spec.md §3.4 + protótipo platform-sidebar.tsx `adminGroups`)
  // — por isso os dois vivem em campos separados em vez de um só `navItems` genérico; `navGroups`
  // fica `[]` quando navMode é "main".
  navItems: NavItem[];
  navGroups: NavGroup[];
  canToggleAdminNav: boolean;
  onToggleNavMode: () => Promise<void>;
  // Colapso é exclusivo do desktop (off-canvas mobile ignora, docs/ui/shell-spec.md §3.1-3.2) —
  // persistido em cookie e resolvido no servidor (get-sidebar-collapsed.ts), nunca client-only
  // (§3.3 do spec registra isso como o que NÃO portar do protótipo).
  collapsed: boolean;
  onToggleCollapsed: () => Promise<void>;
};
