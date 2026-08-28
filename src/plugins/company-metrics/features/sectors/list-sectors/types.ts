import type { OperationResult } from "@/shared/types";
import type { SectorRecord } from "../../../contracts/types";

export type SectorListItem = SectorRecord & {
  memberCount: number;
  groupCount: number;
};

export type ListSectorsResult = OperationResult<SectorListItem[]>;
