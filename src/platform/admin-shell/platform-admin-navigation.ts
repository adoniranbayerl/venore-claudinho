import type { AdminNavItemDefinition } from "./admin-navigation.contracts";

// Únicos itens sem context/plugin dono — Dashboard é a home do próprio admin shell, Plugins é a
// tela do plugin-engine (não de um plugin específico). Todo o resto vem de contexts/plugins.
//
// Dashboard fica em `platform.admin.access` de propósito: é a landing de quem quer que entre no
// admin, inclusive um "admin de seção" (papel custom com só o subconjunto de `*.manage` da sua
// seção — ver Fase D de docs/rbac-scoped-roles.md). Plugins exige `platform.extensions.manage`
// (a mesma permission que instalar/desabilitar já checa) pra esse admin de seção não ver uma
// tela sobre a qual não pode agir.
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
    requiredPermission: "platform.extensions.manage",
  },
];
