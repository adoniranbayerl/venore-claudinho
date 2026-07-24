import type { AdminActor, AdminNavGroup } from "./types";

const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    key: "rbac",
    label: "RBAC",
    items: [
      { key: "roles", label: "Papéis e permissões", href: "/admin/rbac", requiredPermission: "rbac.roles.manage" },
    ],
  },
  {
    key: "content",
    label: "Conteúdo",
    items: [
      {
        key: "cms",
        label: "CMS",
        href: "/admin/cms",
        requiredPermission: ["cms.entries.manage", "cms.content-types.manage", "cms.categories.manage"],
      },
      {
        key: "academy",
        label: "Academy",
        href: "/admin/academy",
        requiredPermission: "academy.courses.manage",
      },
    ],
  },
  {
    key: "settings",
    label: "Configurações",
    items: [
      { key: "settings", label: "Configurações do site", href: "/admin/settings", requiredPermission: "settings.manage" },
      { key: "themes", label: "Temas", href: "/admin/themes", requiredPermission: "settings.manage" },
    ],
  },
];

function hasRequiredPermission(actor: AdminActor, requiredPermission: string | string[] | undefined): boolean {
  if (!requiredPermission) {
    return true;
  }
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some((permission) => actor.permissions.includes(permission));
  }
  return actor.permissions.includes(requiredPermission);
}

export function getVisibleAdminNavGroups(actor: AdminActor): AdminNavGroup[] {
  return ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => actor.isSuperadmin || hasRequiredPermission(actor, item.requiredPermission)),
  })).filter((group) => group.items.length > 0);
}
