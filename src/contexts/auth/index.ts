export { handlers, signIn, signOut } from "./auth.config";
export { getCurrentUserHandler as getCurrentUser } from "./features/session/get-current-user/handler";
export type { AuthenticatedUser } from "./contracts/types";
export type { GetCurrentUserResult } from "./features/session/get-current-user/types";

// Marca um usuário recém-criado como pending. Usado pelo ponto de composição do fluxo de
// registro (src/platform/registration/handle-user-registered.ts, docs/venore-docks.md — regra 12).
export { provisionUserHandler as provisionUser } from "./features/identity/provision-user/handler";
export type { ProvisionUserCommand, ProvisionUserResult } from "./features/identity/provision-user/types";

// Lookup por email, sem verificação de autorização própria — destinado a ferramentas
// administrativas/scripts (ex: scripts/bootstrap-superadmin.mjs), não para uso geral por
// plugin/tema (docs/venore-docks.md — regra 14: expõe usuário por email sem checagem de ator).
export { findUserByEmailHandler as findUserByEmail } from "./features/identity/find-user-by-email/handler";
export type { FindUserByEmailQuery, FindUserByEmailResult } from "./features/identity/find-user-by-email/types";

// Diretório geral de usuários — sem verificação de autorização própria, mesmo raciocínio de
// listPendingUsers (regra 10): quem autoriza é quem compõe (rbac/list-users-by-role, ou o
// loader de página de app/admin/rbac, já gated por rbac.roles.manage antes de chegar aqui).
export { listUsersHandler as listUsers } from "./features/identity/list-users/handler";
export type { UserRef, ListUsersResult } from "./features/identity/list-users/types";

// Primitivos do fluxo de registro (docs/venore-docks.md — Autenticação / Fluxo de registro).
// Sem verificação de autorização própria — quem autoriza é o handler de rbac que compõe com
// eles (contexts/rbac/features/registration-approval/*), via este barrel (regra 10).
export { listPendingUsersHandler as listPendingUsers } from "./features/registration/list-pending-users/handler";
export { approveUserRegistrationHandler as approveUserRegistration } from "./features/registration/approve-user-registration/handler";
export type { PendingUserRef, ListPendingUsersResult } from "./features/registration/list-pending-users/types";
export type { ApproveUserRegistrationInput, ApproveUserRegistrationResult } from "./features/registration/approve-user-registration/types";
