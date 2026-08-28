import type { OperationResult } from "@/shared/types";

export type CompanyMetricsAccess = {
  // company-metrics.manage — configura e vê tudo, delega admins.
  canManageAll: boolean;
  // Setores em que a pessoa é membro "admin" (configura métricas/metas/telas e delega editores).
  adminSectorIds: string[];
  // Setores em que a pessoa é membro "editor" pra cima (lança valores).
  contributorSectorIds: string[];
  // Todos os setores em que é membro, qualquer papel (vê no admin e na visualização).
  memberSectorIds: string[];
};

export type GetMyAccessResult = OperationResult<CompanyMetricsAccess>;
