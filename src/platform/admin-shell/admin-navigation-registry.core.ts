import type { NavGroup } from "@/contexts/themes";
import type { AdminNavItemDefinition } from "./admin-navigation.contracts";
import type { AdminActor } from "./types";

// Lógica pura do registro de navegação admin, separada de admin-navigation-registry.ts de
// propósito: aquele arquivo importa o barrel de cada context (valor, não só tipo), o que puxa
// contexts/cms → auth.config.ts → next-auth/next-server — inválido no processo Vitest unitário
// (AGENTS.md §5, "next-auth é stubado só no config de integração"). Mantendo a montagem/filtro
// aqui, sem nenhum import de context, este módulo é seguro de testar sem banco/stub.

// Chave duplicada é erro de registro, não "a última ganha".
export function assertUniqueNavigationKeys(items: AdminNavItemDefinition[]): void {
  const hrefByKey = new Map<string, string>();
  for (const item of items) {
    const existingHref = hrefByKey.get(item.key);
    if (existingHref) {
      throw new Error(
        `Chave de navegação admin duplicada: "${item.key}" (href "${item.href}" colide com "${existingHref}"). ` +
          "Chave de item precisa ser única em todo o registro (contexts + plugins).",
      );
    }
    hrefByKey.set(item.key, item.href);
  }
}

function hasRequiredPermission(actor: AdminActor, requiredPermission: string | string[] | undefined): boolean {
  if (!requiredPermission) {
    return true;
  }
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some((permission) => actor.permissions.includes(permission));
  }
  return actor.permissions.includes(requiredPermission);
}

// Filtro por permission é feito aqui, no servidor, antes de qualquer serialização pro client —
// item sem permission não entra no payload (docs/venore-docks.md — regra de gate server-side).
export function buildVisibleAdminNavGroups(actor: AdminActor, items: AdminNavItemDefinition[]): NavGroup[] {
  const groupsByKey = new Map<string, { key: string; label: string; order: number; items: AdminNavItemDefinition[] }>();

  for (const item of items) {
    if (!actor.isSuperadmin && !hasRequiredPermission(actor, item.requiredPermission)) {
      continue;
    }

    const group = groupsByKey.get(item.groupKey);
    if (group) {
      group.items.push(item);
      continue;
    }

    groupsByKey.set(item.groupKey, { key: item.groupKey, label: item.groupLabel, order: item.groupOrder, items: [item] });
  }

  return Array.from(groupsByKey.values())
    .sort((left, right) => left.order - right.order)
    .map((group) => ({
      key: group.key,
      label: group.label,
      items: group.items
        .sort((left, right) => left.order - right.order)
        .map((item) => ({
          key: item.key,
          label: item.label,
          href: item.href,
          icon: item.icon,
        })),
    }));
}
