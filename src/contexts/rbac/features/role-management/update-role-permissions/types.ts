import type { OperationResult } from "@/shared/types";
import type { RoleRef } from "../../../contracts/types";

export type UpdateRolePermissionsInput = {
  roleId: string;
  permissionKeys: string[];
};

export type UpdateRolePermissionsCommand = UpdateRolePermissionsInput & {
  actor: { id: string };
};

export type UpdateRolePermissionsResult = OperationResult<RoleRef>;
