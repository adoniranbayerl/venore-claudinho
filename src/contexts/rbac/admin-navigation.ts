import type { AdminNavItemDefinition } from "@/platform/admin-shell/admin-navigation.contracts";

export const rbacAdminNavigationItems: AdminNavItemDefinition[] = [
  {
    key: "rbac.roles",
    label: "Papéis e permissões",
    icon: "users",
    href: "/admin/rbac",
    groupKey: "platform",
    groupLabel: "Plataforma",
    groupOrder: 10,
    order: 60,
    requiredPermission: "rbac.roles.manage",
  },
];
