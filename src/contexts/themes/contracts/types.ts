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

// icon: chave lógica resolvida pra um lucide-react dentro do tema (platform/nav-icons/NavIcon.tsx),
// nunca o componente em si — Server → Client Component não serializa função/componente como prop.
// Pra admin-nav vem do registro agregado em platform/admin-shell/admin-navigation-registry.ts (cada
// context/plugin declara a própria); pra main-nav vem do menu_items.icon escolhido no editor
// (contexts/cms). Em qualquer um dos dois, `icon` ausente ou com chave não reconhecida cai no
// fallback genérico do tema (platform/nav-icons/registry.ts — NAV_ICON_FALLBACK), nunca quebra.
export type NavItem = { key: string; label: string; href: string; icon?: string };
export type NavGroup = { key: string; label: string; items: NavItem[] };

// main-nav é a única navegação com o conceito de agregador (menu_items.targetType "label" —
// contexts/cms/contracts/types.ts): item sem link próprio que só existe pra agrupar filhos
// (renderizado como accordion em SidebarNavLink.tsx, nunca como link). header-nav e admin-nav
// (NavGroup acima) continuam lista plana de propósito — só o menu "main" do CMS produz árvore
// hoje. União discriminada por href: variante "href: null" carrega children (não-vazio — grupo
// vazio é filtrado na composição, platform/theme-rendering/resolve-theme-slot-props.ts, nunca
// chega aqui), variante "href: string" é folha e não tem children.
export type MainNavItem =
  | { key: string; label: string; href: string; icon?: string }
  | { key: string; label: string; href: null; icon?: string; children: MainNavItem[] };
// Árvore, não lista plana: item de primeiro nível é cabeçalho de coluna no footer, filhos são os
// links daquela coluna. href null é o caso "label" do menu (contexts/cms/contracts/types.ts —
// MenuItemTarget) — rótulo sem link, cabeçalho de grupo não clicável. isExternal replica o campo
// homônimo de ResolvedMenuItem (contexts/cms) pra decidir rel/target no componente de sitemap.
export type SitemapItem = {
  key: string;
  label: string;
  href: string | null;
  isExternal: boolean;
  children: SitemapItem[];
};

export type NavMode = "main" | "admin";

// Trilha já resolvida no servidor (platform/breadcrumbs/resolve-breadcrumbs.ts) — o tema só
// recebe e renderiza, nunca resolve rota/entidade sozinho (mesmo Contrato de slot que vale pra
// `user`/`sidebarContextual`). `current` é o último item da lista (a página atual): não é link
// (`href` já vem null pra ele) e é quem recebe aria-current="page" na UI. Itens sem página
// correspondente também chegam com `href: null`, sem precisar ser o último.
export type BreadcrumbItem = {
  key: string;
  label: string;
  href: string | null;
  current: boolean;
};

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

// Mesma forma de HeaderBrand (permite renderizar a marca no footer com o PlatformBrand real, não
// uma versão só-texto) + color/description, que HeaderBrand não tem. brand.color vem de
// contexts/settings (getBrandConfig) mas hoje só era consumido pela impressão de PDF do plugin
// birthdays (Header do tema ainda não pinta a marca por cor, AGENTS.md); o footer usa como
// sublinhado de acento sob a marca — mesma costura de leitura, sem inventar um novo consumo de
// cor pro Header. brand.description é o mesmo campo que o protótipo venore-docks chama de
// footerDescription (PlatformFooter) — um parágrafo curto sob a marca no footer; extensão
// aditiva do contrato (nenhum campo existente mudou), mesmo critério já usado pra `user` em
// HeaderSlotProps, sem bump de themeContractVersion.
export type FooterBrand = HeaderBrand & { color: string; description: string };

export type FooterSlotProps = {
  brand: FooterBrand;
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
  // Trilha da rota atual, já resolvida no servidor — extensão aditiva do contrato, mesmo critério
  // de `sidebarContextual` acima. Lista vazia = tema não renderiza a área de breadcrumb (nenhuma
  // rota registrada casou, ex: rota fora do app router público/admin).
  breadcrumbs: BreadcrumbItem[];
  // Objeto BreadcrumbList (schema.org) já pronto pra serializar — o tema só faz
  // JSON.stringify(breadcrumbsJsonLd) dentro de um <script type="application/ld+json">, nunca
  // monta o objeto sozinho (mesmo Contrato de slot). null quando breadcrumbs está vazio.
  breadcrumbsJsonLd: Record<string, unknown> | null;
};

// SidebarLeft é exclusivo de navegação (main-nav ou admin-nav, conforme navMode) — não é área
// de widgets. O controle de alternância main-nav/admin-nav também mora aqui, não no Header.
export type SidebarLeftSlotProps = {
  enabled: boolean;
  navMode: NavMode;
  // main-nav é uma árvore (não mais lista plana — ver MainNavItem acima): item raiz pode ser um
  // agregador (accordion) com filhos. admin-nav agrupa por seção com título (docs/ui/shell-spec.md
  // §3.4 + protótipo platform-sidebar.tsx `adminGroups`) — por isso os dois vivem em campos
  // separados em vez de um só `navItems` genérico; `navGroups` fica `[]` quando navMode é "main".
  navItems: MainNavItem[];
  navGroups: NavGroup[];
  canToggleAdminNav: boolean;
  onToggleNavMode: () => Promise<void>;
  // Colapso é exclusivo do desktop (off-canvas mobile ignora, docs/ui/shell-spec.md §3.1-3.2) —
  // persistido em cookie e resolvido no servidor (get-sidebar-collapsed.ts), nunca client-only
  // (§3.3 do spec registra isso como o que NÃO portar do protótipo).
  collapsed: boolean;
  onToggleCollapsed: () => Promise<void>;
};

// Shell é o único componente que um tema é obrigado a exportar (docs/themes/shell-contract.md —
// Abordagem A). Recebe exatamente os mesmos dados que antes eram repassados individualmente a
// Header/Footer/SidebarLeft/Content pela composição em `platform/` — nenhum campo novo, só
// reagrupados sob um objeto só. Quem decide a árvore/arranjo entre essas regiões (ordem, lado da
// sidebar, se alguma região existe) é o próprio tema, dentro do seu `Shell` — `platform/` para de
// montar essa árvore. children/sidebarContextual* vêm de `ContentSlotProps` original; um tema não
// é obrigado a ter um componente `ContentSlot` separado — pode compor `children` como quiser
// dentro do próprio `Shell`.
export type ThemeShellProps = {
  header: HeaderSlotProps;
  footer: FooterSlotProps;
  sidebarLeft: SidebarLeftSlotProps;
  children: ReactNode;
  sidebarContextualEnabled: boolean;
  sidebarContextual: ReactNode | null;
  // Repassado direto pro ContentSlot (ou equivalente) do tema — ver comentário em
  // ContentSlotProps.breadcrumbs/breadcrumbsJsonLd acima.
  breadcrumbs: BreadcrumbItem[];
  breadcrumbsJsonLd: Record<string, unknown> | null;
};
