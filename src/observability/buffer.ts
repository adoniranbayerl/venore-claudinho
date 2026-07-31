import type { EventRecord, TraceEntryRecord } from "./contracts/types";

const eventBuffer: EventRecord[] = [];
const traceBuffer: TraceEntryRecord[] = [];

export function pushEvent(entry: EventRecord): number {
  eventBuffer.push(entry);
  return eventBuffer.length;
}

export function pushTraceEntry(entry: TraceEntryRecord): number {
  traceBuffer.push(entry);
  return traceBuffer.length;
}

export function drainEvents(): EventRecord[] {
  return eventBuffer.splice(0, eventBuffer.length);
}

export function drainTraceEntries(): TraceEntryRecord[] {
  return traceBuffer.splice(0, traceBuffer.length);
}

export function peekBufferSizes(): { event: number; trace: number } {
  return { event: eventBuffer.length, trace: traceBuffer.length };
}
