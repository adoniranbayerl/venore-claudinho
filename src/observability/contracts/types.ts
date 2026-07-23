export type OperationKind = "read" | "write";

export type ActorRef = {
  id: string;
  type: string;
};

export type BeginOperationInput = {
  useCase: string;
  actor: ActorRef;
  kind: OperationKind;
};

export type OperationHandle = {
  operationId: string;
  useCase: string;
  actor: ActorRef;
  kind: OperationKind;
  startedAt: Date;
};

export type OperationOutcome =
  | { success: true }
  | { success: false; error: { code: string; message: string } };

export type LogEntryRecord = {
  id: string;
  useCase: string;
  actorId: string;
  actorType: string;
  kind: OperationKind;
  success: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  durationMs: number;
  startedAt: Date;
};

export type TraceEntryRecord = {
  id: string;
  useCase: string;
  actorId: string;
  success: boolean;
  durationMs: number;
  startedAt: Date;
};
