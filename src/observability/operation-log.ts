import { peekBufferSizes, pushLogEntry, pushTraceEntry } from "./buffer";
import { getObservabilityConfig } from "./config";
import { flushNow } from "./flush";
import type {
  BeginOperationInput,
  OperationHandle,
  OperationOutcome,
} from "./contracts/types";

export function beginOperation(input: BeginOperationInput): OperationHandle {
  return {
    operationId: crypto.randomUUID(),
    useCase: input.useCase,
    actor: input.actor,
    kind: input.kind,
    startedAt: new Date(),
  };
}

export function endOperation(handle: OperationHandle, outcome: OperationOutcome): void {
  const endedAt = new Date();
  const durationMs = endedAt.getTime() - handle.startedAt.getTime();

  const shouldLog = handle.kind === "write" || !outcome.success;
  if (shouldLog) {
    pushLogEntry({
      id: handle.operationId,
      useCase: handle.useCase,
      actorId: handle.actor.id,
      actorType: handle.actor.type,
      kind: handle.kind,
      success: outcome.success,
      errorCode: outcome.success ? null : outcome.error.code,
      errorMessage: outcome.success ? null : outcome.error.message,
      durationMs,
      startedAt: handle.startedAt,
    });
  }

  const { traceSampleRate } = getObservabilityConfig();
  const shouldTrace = !outcome.success || Math.random() < traceSampleRate;
  if (shouldTrace) {
    pushTraceEntry({
      id: crypto.randomUUID(),
      useCase: handle.useCase,
      actorId: handle.actor.id,
      success: outcome.success,
      durationMs,
      startedAt: handle.startedAt,
    });
  }

  const { flushBatchSize } = getObservabilityConfig();
  const sizes = peekBufferSizes();
  if (sizes.log >= flushBatchSize || sizes.trace >= flushBatchSize) {
    void flushNow();
  }
}
