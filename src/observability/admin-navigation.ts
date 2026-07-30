import type { AdminNavItemDefinition } from "@/platform/admin-shell/admin-navigation.contracts";

export const observabilityAdminNavigationItems: AdminNavItemDefinition[] = [
  {
    key: "observability.diagnostics",
    label: "Diagnostics",
    icon: "activity",
    href: "/admin/diagnostics",
    groupKey: "system",
    groupLabel: "Sistema",
    groupOrder: 40,
    order: 10,
    requiredPermission: "observability.logs.view",
  },
];
