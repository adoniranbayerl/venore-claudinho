import type { OperationResult } from "@/shared/types";

export type CountUsersWithPermissionsQuery = { permissionKeys: string[] };

// Só a contagem, não a lista — usado pra compor texto de confirmação (ex: "3 usuários perdem
// acesso"), nunca pra listar quem são (isso continua exclusivo de listUsersByRole, que exige
// rbac.roles.manage). Superadmin não entra na contagem: seu acesso não depende do catálogo de
// permissions (bypassa a checagem em authorizeActor), então desabilitar um plugin nunca "tira"
// acesso de um superadmin.
export type CountUsersWithPermissionsResult = OperationResult<number>;
