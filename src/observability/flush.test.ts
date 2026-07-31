import { beforeEach, describe, expect, it, vi } from "vitest";
import { drainEvents, drainTraceEntries, pushEvent, pushTraceEntry } from "./buffer";
import type { EventRecord, TraceEntryRecord } from "./contracts/types";

const insertValues = vi.fn().mockResolvedValue(undefined);
const insert = vi.fn(() => ({ values: insertValues }));

vi.mock("@/infrastructure/database/client", () => ({
  db: { insert },
}));

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

describe("observability flush", () => {
  beforeEach(() => {
    drainEvents();
    drainTraceEntries();
    insert.mockClear();
    insertValues.mockClear();
    insertValues.mockResolvedValue(undefined);
  });

  it("writes buffered entries in a single batched insert per table", async () => {
    const { flushNow } = await import("./flush");

    pushEvent(makeEvent({ id: "event-1" }));
    pushEvent(makeEvent({ id: "event-2" }));
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

    pushEvent(makeEvent());

    await expect(flushNow()).resolves.toBeUndefined();
  });
});
