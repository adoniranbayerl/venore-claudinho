// Primitivo de autorização reutilizável por handlers de outros contexts de domínio (regra 10:
// service/handler de um context pode chamar a API pública de outro para compor). Usado, por
// exemplo, por contexts/themes/features/active-theme/activate-theme/handler.ts.
export { authorizeActor } from "./authorize-actor";
export type { AuthorizeActorResult } from "./authorize-actor";

export { createCustomRoleHandler as createCustomRole } from "./features/role-management/create-custom-role/handler";
export { updateRolePermissionsHandler as updateRolePermissions } from "./features/role-management/update-role-permissions/handler";
export { listRolesHandler as listRoles } from "./features/role-management/list-roles/handler";
export { assignRoleToUserHandler as assignRoleToUser } from "./features/role-assignment/assign-role-to-user/handler";
export { removeRoleFromUserHandler as removeRoleFromUser } from "./features/role-assignment/remove-role-from-user/handler";
export { getUserContextHandler as getUserContext } from "./features/role-assignment/get-user-context/handler";
export { listUsersByRoleHandler as listUsersByRole } from "./features/role-assignment/list-users-by-role/handler";
// Concessão automática do fluxo de registro (docs/venore-docks.md — Autenticação / Fluxo de
// registro) — sem authorizeActor de propósito, ver nota em assign-default-role/handler.ts.
export { grantDefaultRoleOnRegistrationHandler as grantDefaultRoleOnRegistration } from "./features/role-assignment/assign-default-role/handler";
// Bootstrap de superadmin (docs/venore-docks.md — Autenticação / Bootstrap de superadmin) — sem
// authorizeActor de propósito, ver nota em grant-superadmin/handler.ts.
export { checkSuperadminExistsHandler as superadminExists } from "./features/role-assignment/check-superadmin-exists/handler";
export { grantSuperadminHandler as grantSuperadmin } from "./features/role-assignment/grant-superadmin/handler";
export { approveRegistrationHandler as approveRegistration } from "./features/registration-approval/approve-registration/handler";
export { listPendingRegistrationsHandler as listPendingRegistrations } from "./features/registration-approval/list-pending-registrations/handler";

export { rbacAdminNavigationItems } from "./admin-navigation";

export type { RoleRef, PermissionDefinition, UserRbacContext } from "./contracts/types";
export { SYSTEM_ROLE_KEYS } from "./contracts/roles";
export type { SystemRoleKey } from "./contracts/roles";
export { RBAC_PERMISSIONS } from "./contracts/permissions";

export type { CreateCustomRoleInput, CreateCustomRoleResult } from "./features/role-management/create-custom-role/types";
export type { UpdateRolePermissionsInput, UpdateRolePermissionsResult } from "./features/role-management/update-role-permissions/types";
export type { RoleWithPermissions, ListRolesResult } from "./features/role-management/list-roles/types";
export type { AssignRoleToUserInput, AssignRoleToUserResult } from "./features/role-assignment/assign-role-to-user/types";
export type { RemoveRoleFromUserInput, RemoveRoleFromUserResult } from "./features/role-assignment/remove-role-from-user/types";
export type { GetUserContextQuery, GetUserContextResult } from "./features/role-assignment/get-user-context/types";
export type { ListUsersByRoleInput, ListUsersByRoleResult, RoleUserRef } from "./features/role-assignment/list-users-by-role/types";
export type { GrantDefaultRoleInput, GrantDefaultRoleResult } from "./features/role-assignment/assign-default-role/types";
export type { CheckSuperadminExistsResult } from "./features/role-assignment/check-superadmin-exists/types";
export type { GrantSuperadminInput, GrantSuperadminResult } from "./features/role-assignment/grant-superadmin/types";
export type { ApproveRegistrationInput, ApproveRegistrationResult } from "./features/registration-approval/approve-registration/types";
export type { ListPendingRegistrationsResult, PendingRegistrationView } from "./features/registration-approval/list-pending-registrations/types";
