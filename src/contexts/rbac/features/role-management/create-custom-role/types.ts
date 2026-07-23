import type { OperationResult } from "@/shared/types";
import type { RoleRef } from "../../../contracts/types";

export type CreateCustomRoleInput = {
  key: string;
  name: string;
  permissionKeys: string[];
};

export type CreateCustomRoleCommand = CreateCustomRoleInput & {
  actor: { id: string };
};

export type CreateCustomRoleResult = OperationResult<RoleRef>;
