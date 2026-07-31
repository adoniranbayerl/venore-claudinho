import { beforeEach, describe, expect, it } from "vitest";
import { drainEvents, drainTraceEntries, peekBufferSizes, pushEvent, pushTraceEntry } from "./buffer";
import type { EventRecord, TraceEntryRecord } from "./contracts/types";

function makeEvent(overrides: Partial<EventRecord> = {}): EventRecord {
  return {
    id: "event-1",
    occurredAt: new Date(),
    level: "info",
    origin: "context:example",
    action: "example.do-thing",
    actorId: "actor-1",
    actorType: "user",
    outcome: "success",
    summary: "Ação de exemplo concluída.",
    detail: null,
    errorCode: null,
    errorMessage: null,
    durationMs: 10,
    ...overrides,
  };
}

function makeTraceEntry(overrides: Partial<TraceEntryRecord> = {}): TraceEntryRecord {
  return {
    id: "trace-1",
    useCase: "example.do-thing",
    actorId: "actor-1",
    success: true,
    durationMs: 10,
    startedAt: new Date(),
    ...overrides,
  };
}

describe("observability buffer", () => {
  beforeEach(() => {
    drainEvents();
    drainTraceEntries();
  });

  it("accumulates pushed entries and reports sizes", () => {
    pushEvent(makeEvent());
    pushTraceEntry(makeTraceEntry());
    pushTraceEntry(makeTraceEntry({ id: "trace-2" }));

    expect(peekBufferSizes()).toEqual({ event: 1, trace: 2 });
  });

  it("drain empties the buffer and returns everything that was pushed", () => {
    pushEvent(makeEvent({ id: "event-1" }));
    pushEvent(makeEvent({ id: "event-2" }));

    const drained = drainEvents();

    expect(drained.map((entry) => entry.id)).toEqual(["event-1", "event-2"]);
    expect(peekBufferSizes().event).toBe(0);
  });

  it("drain does not lose entries pushed after the drain started reading", () => {
    pushEvent(makeEvent({ id: "event-1" }));
    const first = drainEvents();
    pushEvent(makeEvent({ id: "event-2" }));
    const second = drainEvents();

    expect(first.map((entry) => entry.id)).toEqual(["event-1"]);
    expect(second.map((entry) => entry.id)).toEqual(["event-2"]);
  });
});
