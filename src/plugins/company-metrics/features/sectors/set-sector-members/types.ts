import type { OperationResult } from "@/shared/types";
import type { SectorMemberRole } from "../../../contracts/types";

export type SectorMemberAssignment = { userId: string; role: SectorMemberRole };

export type SetSectorMembersCommand = {
  sectorId: string;
  members: SectorMemberAssignment[];
  // true só quando o ator tem company-metrics.manage — só ele pode adicionar/remover/alterar
  // linhas com role "admin". Um admin de setor (sem a permission ampla) mexe só em editor/viewer.
  canManageAdmins: boolean;
  actorId: string;
};

export type SetSectorMembersInput = { sectorId: string; members: SectorMemberAssignment[] };
export type SetSectorMembersResult = OperationResult<{ sectorId: string; members: SectorMemberAssignment[] }>;
