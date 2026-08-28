import type { OperationResult } from "@/shared/types";
import type { SectorGroupRecord } from "../../../contracts/types";

export type UpdateSectorGroupCommand = {
  groupId: string;
  label: string;
  logoMediaId?: string | null;
  actorId: string;
};

export type UpdateSectorGroupInput = Omit<UpdateSectorGroupCommand, "actorId">;
export type UpdateSectorGroupResult = OperationResult<SectorGroupRecord>;
