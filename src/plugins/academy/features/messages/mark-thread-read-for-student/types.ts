import type { OperationResult } from "@/shared/types";

export type MarkThreadReadForStudentInput = { threadId: string };
export type MarkThreadReadForStudentResult = OperationResult<{ threadId: string }>;
