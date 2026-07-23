export { createCustomRoleHandler as createCustomRole } from "./features/role-management/create-custom-role/handler";
export { updateRolePermissionsHandler as updateRolePermissions } from "./features/role-management/update-role-permissions/handler";
export { assignRoleToUserHandler as assignRoleToUser } from "./features/role-assignment/assign-role-to-user/handler";
export { removeRoleFromUserHandler as removeRoleFromUser } from "./features/role-assignment/remove-role-from-user/handler";
export { getUserContextHandler as getUserContext } from "./features/role-assignment/get-user-context/handler";

export type { RoleRef, PermissionDefinition, UserRbacContext } from "./contracts/types";
export { SYSTEM_ROLE_KEYS } from "./contracts/roles";
export type { SystemRoleKey } from "./contracts/roles";
export { RBAC_PERMISSIONS } from "./contracts/permissions";

export type { CreateCustomRoleInput, CreateCustomRoleResult } from "./features/role-management/create-custom-role/types";
export type { UpdateRolePermissionsInput, UpdateRolePermissionsResult } from "./features/role-management/update-role-permissions/types";
export type { AssignRoleToUserInput, AssignRoleToUserResult } from "./features/role-assignment/assign-role-to-user/types";
export type { RemoveRoleFromUserInput, RemoveRoleFromUserResult } from "./features/role-assignment/remove-role-from-user/types";
export type { GetUserContextQuery, GetUserContextResult } from "./features/role-assignment/get-user-context/types";
