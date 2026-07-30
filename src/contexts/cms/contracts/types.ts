export type ContentTypeRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryRecord = {
  id: string;
  key: string;
  slug: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EntryStatus = "draft" | "published";

export type EntryRecord = {
  id: string;
  contentTypeId: string;
  categoryId: string | null;
  title: string;
  slug: string;
  status: EntryStatus;
  data: unknown;
  mediaId: string | null;
  authorId: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// "main" | "header" | "sitemap": no máximo um menu por location (unique index parcial no schema).
// "contextual": vários menus, cada um com scopePath (prefixo de rota) — ver menu-resolution.ts.
export type MenuLocation = "main" | "header" | "contextual" | "sitemap";

export type MenuRecord = {
  id: string;
  key: string;
  name: string;
  location: MenuLocation;
  scopePath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// União discriminada, não um contentId anulável — só o campo do targetType escolhido é
// preenchido. "content" guarda o id da entry (não a URL): href é resolvido em tempo de leitura a
// partir da rota atual daquela entry, mesmo princípio de mediaId (ver comentário em EntryRecord
// acima e no schema). "label" é rótulo sem link — agrupador, usado em sitemap/submenu.
export type MenuItemTarget =
  | { targetType: "content"; contentId: string }
  | { targetType: "route"; routePath: string; requiredPermissionKey: string | null }
  | { targetType: "external"; externalUrl: string }
  | { targetType: "label" };

export type MenuItemRecord = {
  id: string;
  menuId: string;
  parentId: string | null;
  // Rótulo próprio do item — independente do título do conteúdo apontado (quando for "content").
  label: string;
  order: number;
  isVisible: boolean;
  // Chave lógica de ícone (contexts/themes/contracts/types.ts — NavItem/MainNavItem.icon), nunca
  // o componente — escolhida por quem monta o menu (editor admin), resolvida pro lucide-react
  // real só dentro do tema (platform/nav-icons/registry.ts). Opcional em qualquer targetType.
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
} & MenuItemTarget;
