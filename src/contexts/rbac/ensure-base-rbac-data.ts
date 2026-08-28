import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roles, rolePermissions } from "./database/schema";
import { SYSTEM_ROLE_KEYS } from "./contracts/roles";
// Fonte única das listas de permissions base dos papéis de sistema — antes duplicada à mão aqui e
// em drizzle/0027_seed_base_role_permissions.sql (I5). O .sql já rodou e não muda; este import
// passa a ser a fonte da verdade daqui pra frente. editor/author entraram na Fase A de
// docs/rbac-scoped-roles.md e são semeados só pelo self-heal (sem migration própria).
import {
  ADMIN_BASE_PERMISSION_KEYS,
  AUTHOR_BASE_PERMISSION_KEYS,
  EDITOR_BASE_PERMISSION_KEYS,
} from "./contracts/base-role-permissions";

// Aliases canônicos de exibição dos papéis de sistema (Fase A de docs/rbac-scoped-roles.md — D9).
// O self-heal é a fonte da verdade destes nomes; scripts/seed-role-display-names.mjs foi aposentado.
const SYSTEM_ROLE_NAMES: Record<(typeof SYSTEM_ROLE_KEYS)[number], string> = {
  superadmin: "Overlord",
  admin: "Administrador",
  member: "Membro",
  editor: "Editor",
  author: "Autor",
};

// Permissions base por papel de sistema — só papéis com conjunto pré-semeado entram aqui
// (member/superadmin não recebem linhas de role_permissions pelo self-heal).
const SYSTEM_ROLE_BASE_PERMISSIONS: Record<string, readonly string[]> = {
  admin: ADMIN_BASE_PERMISSION_KEYS,
  editor: EDITOR_BASE_PERMISSION_KEYS,
  author: AUTHOR_BASE_PERMISSION_KEYS,
};

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

    for (const [roleKey, permissionKeys] of Object.entries(SYSTEM_ROLE_BASE_PERMISSIONS)) {
      const [role] = await tx.select({ id: roles.id }).from(roles).where(eq(roles.key, roleKey)).limit(1);
      if (!role) continue;

      await tx
        .insert(rolePermissions)
        .values(permissionKeys.map((permissionKey) => ({ roleId: role.id, permissionKey })))
        .onConflictDoNothing({ target: [rolePermissions.roleId, rolePermissions.permissionKey] });
    }
  });
}
