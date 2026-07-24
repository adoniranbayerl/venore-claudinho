import type { OperationResult } from "@/shared/types";
import type { RoleRef } from "../../../contracts/types";

export type RoleWithPermissions = RoleRef & { permissionKeys: string[] };

export type ListRolesResult = OperationResult<RoleWithPermissions[]>;
