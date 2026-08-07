import type { OperationResult } from "@/shared/types";

export type MessageAlert = { count: number; href: string; label: string };
export type GetMessageAlertInput = { actorId: string; isTeacher: boolean };
export type GetMessageAlertResult = OperationResult<MessageAlert | null>;
