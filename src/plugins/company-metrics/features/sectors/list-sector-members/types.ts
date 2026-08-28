import type { OperationResult } from "@/shared/types";
import type { SectorMemberRecord } from "../../../contracts/types";

export type ListSectorMembersResult = OperationResult<SectorMemberRecord[]>;
