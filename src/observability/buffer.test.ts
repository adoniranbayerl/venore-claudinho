import { beforeEach, describe, expect, it } from "vitest";
import { drainLogEntries, drainTraceEntries, peekBufferSizes, pushLogEntry, pushTraceEntry } from "./buffer";
import type { LogEntryRecord, TraceEntryRecord } from "./contracts/types";

function makeLogEntry(overrides: Partial<LogEntryRecord> = {}): LogEntryRecord {
  return {
    id: "log-1",
    useCase: "example.do-thing",
    actorId: "actor-1",
    actorType: "user",
    kind: "write",
    success: true,
    errorCode: null,
    errorMessage: null,
    durationMs: 10,
    startedAt: new Date(),
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
    drainLogEntries();
    drainTraceEntries();
  });

  it("accumulates pushed entries and reports sizes", () => {
    pushLogEntry(makeLogEntry());
    pushTraceEntry(makeTraceEntry());
    pushTraceEntry(makeTraceEntry({ id: "trace-2" }));

    expect(peekBufferSizes()).toEqual({ log: 1, trace: 2 });
  });

  it("drain empties the buffer and returns everything that was pushed", () => {
    pushLogEntry(makeLogEntry({ id: "log-1" }));
    pushLogEntry(makeLogEntry({ id: "log-2" }));

    const drained = drainLogEntries();

    expect(drained.map((entry) => entry.id)).toEqual(["log-1", "log-2"]);
    expect(peekBufferSizes().log).toBe(0);
  });

  it("drain does not lose entries pushed after the drain started reading", () => {
    pushLogEntry(makeLogEntry({ id: "log-1" }));
    const first = drainLogEntries();
    pushLogEntry(makeLogEntry({ id: "log-2" }));
    const second = drainLogEntries();

    expect(first.map((entry) => entry.id)).toEqual(["log-1"]);
    expect(second.map((entry) => entry.id)).toEqual(["log-2"]);
  });
});
