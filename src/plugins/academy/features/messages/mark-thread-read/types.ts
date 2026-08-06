import type { OperationResult } from "@/shared/types";

export type MarkThreadReadInput = { threadId: string };
export type MarkThreadReadCommand = MarkThreadReadInput & { actorId: string };
export type MarkThreadReadResult = OperationResult<{ threadId: string }>;
