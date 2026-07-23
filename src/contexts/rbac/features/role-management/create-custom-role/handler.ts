import { authorizeActor } from "../../../authorize-actor";
import { SYSTEM_ROLE_KEYS } from "../../../contracts/roles";
import { createCustomRole } from "./service";
import type { CreateCustomRoleInput, CreateCustomRoleResult } from "./types";

const KEBAB_CASE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function createCustomRoleHandler(input: CreateCustomRoleInput): Promise<CreateCustomRoleResult> {
  if (!KEBAB_CASE_PATTERN.test(input.key)) {
    return {
      success: false,
      error: { code: "rbac.roles.invalid_key", message: "A key do papel deve estar em kebab-case." },
    };
  }

  if ((SYSTEM_ROLE_KEYS as readonly string[]).includes(input.key)) {
    return {
      success: false,
      error: { code: "rbac.roles.reserved_key", message: `"${input.key}" é uma key reservada para papéis de sistema.` },
    };
  }

  if (input.name.trim().length === 0) {
    return {
      success: false,
      error: { code: "rbac.roles.invalid_name", message: "O nome do papel não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("rbac.roles.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createCustomRole({ ...input, actor: { id: authz.actorId } });
}
