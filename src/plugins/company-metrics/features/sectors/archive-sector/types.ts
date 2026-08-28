import type { OperationResult } from "@/shared/types";
import type { SectorRecord } from "../../../contracts/types";

export type ArchiveSectorCommand = { sectorId: string; archived: boolean; actorId: string };
export type ArchiveSectorInput = Omit<ArchiveSectorCommand, "actorId">;
export type ArchiveSectorResult = OperationResult<SectorRecord>;
