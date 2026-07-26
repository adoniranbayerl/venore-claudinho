import type { OperationResult } from "@/shared/types";
import type { Composition } from "../../../contracts/block";

export type GetEntryCompositionQuery = { id: string };
export type GetEntryCompositionResult = OperationResult<Composition | null>;
