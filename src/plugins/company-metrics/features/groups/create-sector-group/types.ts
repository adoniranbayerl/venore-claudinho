import type { OperationResult } from "@/shared/types";
import type { SectorGroupRecord } from "../../../contracts/types";

export type CreateSectorGroupCommand = {
  sectorId: string;
  label: string;
  logoMediaId?: string | null;
  actorId: string;
};

export type CreateSectorGroupInput = Omit<CreateSectorGroupCommand, "actorId">;
export type CreateSectorGroupResult = OperationResult<SectorGroupRecord>;
