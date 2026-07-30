import type { AdminNavItemDefinition } from "@/platform/admin-shell/admin-navigation.contracts";

export const mediaAdminNavigationItems: AdminNavItemDefinition[] = [
  {
    key: "media.library",
    label: "Mídia",
    icon: "image",
    href: "/admin/media",
    groupKey: "content",
    groupLabel: "Conteúdo",
    groupOrder: 20,
    order: 50,
    requiredPermission: "media.manage",
  },
];
