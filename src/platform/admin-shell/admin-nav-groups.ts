import type { NavItem } from "@/contexts/themes";
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
        requiredPermission: [
          "cms.entries.manage",
          "cms.content-types.manage",
          "cms.categories.manage",
          "cms.menus.manage",
        ],
      },
      {
        key: "academy",
        label: "Academy",
        href: "/admin/academy",
        requiredPermission: "academy.courses.manage",
      },
      {
        key: "media",
        label: "Mídia",
        href: "/admin/media",
        requiredPermission: "media.manage",
      },
    ],
  },
  {
    key: "settings",
    label: "Configurações",
    items: [
      { key: "settings", label: "Configurações do site", href: "/admin/settings", requiredPermission: "settings.manage" },
      { key: "themes", label: "Temas", href: "/admin/themes", requiredPermission: "settings.manage" },
      {
        key: "diagnostics",
        label: "Diagnostics",
        href: "/admin/diagnostics",
        requiredPermission: "observability.logs.view",
      },
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

// admin-nav não é mais uma sidebar à parte — é o navItems do Header quando navMode === "admin"
// (contrato de slot, docs/venore-docks.md — "Shell única"), então os grupos são achatados numa
// lista única, já filtrada por permission no servidor.
export function getVisibleAdminNavItems(actor: AdminActor): NavItem[] {
  return getVisibleAdminNavGroups(actor).flatMap((group) =>
    group.items.map((item) => ({ key: `${group.key}.${item.key}`, label: item.label, href: item.href })),
  );
}
