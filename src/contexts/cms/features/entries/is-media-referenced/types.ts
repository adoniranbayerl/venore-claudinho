import type { OperationResult } from "@/shared/types";

export type IsMediaReferencedQuery = { mediaId: string };
export type IsMediaReferencedResult = OperationResult<boolean>;
