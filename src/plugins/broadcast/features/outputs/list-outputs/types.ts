import type { OperationResult } from "@/shared/types";
import type { BroadcastOutputRecord } from "../../../contracts/types";

export type ListOutputsResult = OperationResult<BroadcastOutputRecord[]>;
