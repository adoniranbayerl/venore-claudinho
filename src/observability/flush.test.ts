import { beforeEach, describe, expect, it, vi } from "vitest";
import { drainLogEntries, drainTraceEntries, pushLogEntry, pushTraceEntry } from "./buffer";
import type { LogEntryRecord, TraceEntryRecord } from "./contracts/types";

const insertValues = vi.fn().mockResolvedValue(undefined);
const insert = vi.fn(() => ({ values: insertValues }));

vi.mock("@/infrastructure/database/client", () => ({
  db: { insert },
}));

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

describe("observability flush", () => {
  beforeEach(() => {
    drainLogEntries();
    drainTraceEntries();
    insert.mockClear();
    insertValues.mockClear();
    insertValues.mockResolvedValue(undefined);
  });

  it("writes buffered entries in a single batched insert per table", async () => {
    const { flushNow } = await import("./flush");

    pushLogEntry(makeLogEntry({ id: "log-1" }));
    pushLogEntry(makeLogEntry({ id: "log-2" }));
    pushTraceEntry(makeTraceEntry({ id: "trace-1" }));

    await flushNow();

    expect(insert).toHaveBeenCalledTimes(2);
    expect(insertValues).toHaveBeenCalledTimes(2);
    expect(insertValues.mock.calls[0][0]).toHaveLength(2);
    expect(insertValues.mock.calls[1][0]).toHaveLength(1);
  });

  it("does not touch the database when both buffers are empty", async () => {
    const { flushNow } = await import("./flush");

    await flushNow();

    expect(insert).not.toHaveBeenCalled();
  });

  it("swallows insert errors instead of throwing", async () => {
    insertValues.mockRejectedValueOnce(new Error("connection lost"));
    const { flushNow } = await import("./flush");

    pushLogEntry(makeLogEntry());

    await expect(flushNow()).resolves.toBeUndefined();
  });
});
