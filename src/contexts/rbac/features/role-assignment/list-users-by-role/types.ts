import type { OperationResult } from "@/shared/types";

export type ListUsersByRoleInput = {
  roleId: string;
};

export type RoleUserRef = {
  id: string;
  name: string | null;
  email: string;
};

export type ListUsersByRoleResult = OperationResult<RoleUserRef[]>;
