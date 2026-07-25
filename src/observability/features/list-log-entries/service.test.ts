import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LogEntrySummary } from "./types";

const findLogEntries = vi.fn();

vi.mock("./store", () => ({
  findLogEntries: (...args: unknown[]) => findLogEntries(...args),
}));

function makeEntry(overrides: Partial<LogEntrySummary> = {}): LogEntrySummary {
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

describe("listLogEntries", () => {
  beforeEach(() => {
    findLogEntries.mockReset();
  });

  it("forwards the query to the store and returns its result", async () => {
    const entry = makeEntry();
    findLogEntries.mockResolvedValue({ entries: [entry], hasMore: true });

    const { listLogEntries } = await import("./service");
    const result = await listLogEntries({ success: false, useCase: "example.do-thing", cursor: "log-0" });

    expect(findLogEntries).toHaveBeenCalledWith({ success: false, useCase: "example.do-thing", cursor: "log-0" });
    expect(result).toEqual({ success: true, data: { entries: [entry], hasMore: true } });
  });

  it("defaults to an empty query", async () => {
    findLogEntries.mockResolvedValue({ entries: [], hasMore: false });

    const { listLogEntries } = await import("./service");
    const result = await listLogEntries();

    expect(findLogEntries).toHaveBeenCalledWith({});
    expect(result).toEqual({ success: true, data: { entries: [], hasMore: false } });
  });
});
