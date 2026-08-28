import type { OperationResult } from "@/shared/types";
import type { SectorRecord } from "../../../contracts/types";

export type CreateSectorCommand = {
  name: string;
  description?: string | null;
  icon?: string | null;
  actorId: string;
};

export type CreateSectorInput = Omit<CreateSectorCommand, "actorId">;
export type CreateSectorResult = OperationResult<SectorRecord>;
