import type { LogEntryRecord, TraceEntryRecord } from "./contracts/types";

const logBuffer: LogEntryRecord[] = [];
const traceBuffer: TraceEntryRecord[] = [];

export function pushLogEntry(entry: LogEntryRecord): number {
  logBuffer.push(entry);
  return logBuffer.length;
}

export function pushTraceEntry(entry: TraceEntryRecord): number {
  traceBuffer.push(entry);
  return traceBuffer.length;
}

export function drainLogEntries(): LogEntryRecord[] {
  return logBuffer.splice(0, logBuffer.length);
}

export function drainTraceEntries(): TraceEntryRecord[] {
  return traceBuffer.splice(0, traceBuffer.length);
}

export function peekBufferSizes(): { log: number; trace: number } {
  return { log: logBuffer.length, trace: traceBuffer.length };
}
