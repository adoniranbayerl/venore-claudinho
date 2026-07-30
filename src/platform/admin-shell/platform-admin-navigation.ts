import type { AdminNavItemDefinition } from "./admin-navigation.contracts";

// Únicos itens sem context/plugin dono — Dashboard é a home do próprio admin shell, Plugins é a
// tela do plugin-engine (não de um plugin específico). Todo o resto vem de contexts/plugins.
export const platformAdminNavigationItems: AdminNavItemDefinition[] = [
  {
    key: "platform.dashboard",
    label: "Dashboard",
    icon: "home",
    href: "/admin",
    groupKey: "platform",
    groupLabel: "Plataforma",
    groupOrder: 10,
    order: 10,
    requiredPermission: "platform.admin.access",
  },
  {
    key: "platform.plugins",
    label: "Plugins",
    icon: "puzzle",
    href: "/admin/plugins",
    groupKey: "platform",
    groupLabel: "Plataforma",
    groupOrder: 10,
    order: 40,
    requiredPermission: "platform.admin.access",
  },
];
