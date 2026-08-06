import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roles, rolePermissions } from "./database/schema";
import { SYSTEM_ROLE_KEYS } from "./contracts/roles";

const SYSTEM_ROLE_NAMES: Record<(typeof SYSTEM_ROLE_KEYS)[number], string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  member: "Member",
};

// Espelha drizzle/0027_seed_base_role_permissions.sql — lista explícita, não derivada de
// RBAC_PERMISSIONS de propósito (mesmo racional do comentário em 0027): uma permission nova só
// alcança "admin" por decisão explícita registrada aqui/numa migration, nunca automaticamente por
// já estar no catálogo. media.purge fica de fora (reservada a superadmin, que não passa por
// role_permissions — authorize-actor.ts libera incondicional).
const ADMIN_BASE_PERMISSION_KEYS = [
  "rbac.roles.manage",
  "rbac.roles.assign",
  "rbac.registrations.approve",
  "settings.manage",
  "cms.content-types.manage",
  "cms.categories.manage",
  "cms.entries.manage",
  "cms.entries.publish",
  "cms.menus.manage",
  "platform.admin.access",
  "platform.extensions.manage",
  "media.manage",
  "observability.logs.view",
  "observability.logs.clear",
  "observability.audit.view",
] as const;

// Self-heal do dado de bootstrap do RBAC (drizzle/0002 + drizzle/0027) — db:migrate é hoje manual
// (ver AGENTS.md/package.json), então grant-superadmin/assign-default-role não podem mais assumir
// que alguém já rodou todas as migrations. Idempotente por índice único (roles.key,
// role_permissions[role_id,permission_key]), seguro chamar em toda concessão de papel — mesmo
// espírito de get-or-create-reserved-category.ts e register-default-setting/store.ts.
export async function ensureBaseRbacDataSeeded(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .insert(roles)
      .values(SYSTEM_ROLE_KEYS.map((key) => ({ key, name: SYSTEM_ROLE_NAMES[key], isSystem: true })))
      .onConflictDoNothing({ target: roles.key });

    const [adminRole] = await tx.select({ id: roles.id }).from(roles).where(eq(roles.key, "admin")).limit(1);
    if (!adminRole) return;

    await tx
      .insert(rolePermissions)
      .values(ADMIN_BASE_PERMISSION_KEYS.map((permissionKey) => ({ roleId: adminRole.id, permissionKey })))
      .onConflictDoNothing({ target: [rolePermissions.roleId, rolePermissions.permissionKey] });
  });
}
