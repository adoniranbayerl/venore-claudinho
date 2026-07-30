import type { AdminNavItemDefinition } from "@/platform/admin-shell/admin-navigation.contracts";

export const settingsAdminNavigationItems: AdminNavItemDefinition[] = [
  {
    key: "settings.general",
    label: "Configurações",
    icon: "settings",
    href: "/admin/settings",
    groupKey: "platform",
    groupLabel: "Plataforma",
    groupOrder: 10,
    order: 20,
    requiredPermission: "settings.manage",
  },
  {
    key: "settings.appearance",
    label: "Aparência",
    icon: "palette",
    href: "/admin/settings/appearance",
    groupKey: "platform",
    groupLabel: "Plataforma",
    groupOrder: 10,
    order: 30,
    requiredPermission: "settings.manage",
  },
];
