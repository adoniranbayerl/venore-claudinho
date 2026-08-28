import type { OperationResult } from "@/shared/types";

export type AdminSetUserPasswordCommand = { actorId: string; targetUserId: string; newPassword: string };

// `bypassAuthorization` só existe para o instalador (scripts/install-fresh.ts), que roda sem
// sessão/ator — mesmo racional do `bypassExistsCheck` de grant-superadmin. Um chamador normal
// (Server Action / route handler) nunca passa isso; o handler continua exigindo
// rbac.roles.manage.
export type AdminSetUserPasswordInput = Omit<AdminSetUserPasswordCommand, "actorId"> & {
  bypassAuthorization?: boolean;
};
export type AdminSetUserPasswordResult = OperationResult<{ id: string }>;
