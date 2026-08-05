import type { OperationResult } from "@/shared/types";
import type { RoleRef } from "../../../contracts/types";

export type RenameRoleInput = {
  roleId: string;
  name: string;
};

export type RenameRoleCommand = RenameRoleInput & {
  actor: { id: string };
};

export type RenameRoleResult = OperationResult<RoleRef>;
