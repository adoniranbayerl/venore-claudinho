import type { AdminNavItemDefinition } from "@/platform/admin-shell/admin-navigation.contracts";

export const themesAdminNavigationItems: AdminNavItemDefinition[] = [
  {
    key: "themes.catalog",
    label: "Temas",
    icon: "layout-template",
    href: "/admin/themes",
    groupKey: "platform",
    groupLabel: "Plataforma",
    groupOrder: 10,
    order: 50,
    requiredPermission: "settings.manage",
  },
];
