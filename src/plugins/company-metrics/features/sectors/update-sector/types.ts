import type { OperationResult } from "@/shared/types";
import type { SectorRecord } from "../../../contracts/types";

export type UpdateSectorCommand = {
  sectorId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  actorId: string;
};

export type UpdateSectorInput = Omit<UpdateSectorCommand, "actorId">;
export type UpdateSectorResult = OperationResult<SectorRecord>;
