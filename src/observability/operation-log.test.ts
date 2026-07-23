import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { drainLogEntries, drainTraceEntries } from "./buffer";

vi.mock("./flush", () => ({ flushNow: vi.fn() }));

describe("operation log", () => {
  beforeEach(() => {
    drainLogEntries();
    drainTraceEntries();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("always logs a successful write operation", async () => {
    const { beginOperation, endOperation } = await import("./operation-log");

    const handle = beginOperation({ useCase: "example.write-thing", actor: { id: "u1", type: "user" }, kind: "write" });
    endOperation(handle, { success: true });

    const logs = drainLogEntries();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ useCase: "example.write-thing", kind: "write", success: true });
  });

  it("does not log a successful read operation", async () => {
    const { beginOperation, endOperation } = await import("./operation-log");

    const handle = beginOperation({ useCase: "example.list-things", actor: { id: "u1", type: "user" }, kind: "read" });
    endOperation(handle, { success: true });

    expect(drainLogEntries()).toHaveLength(0);
  });

  it("logs a failed read operation, carrying the error", async () => {
    const { beginOperation, endOperation } = await import("./operation-log");

    const handle = beginOperation({ useCase: "example.get-thing", actor: { id: "u1", type: "user" }, kind: "read" });
    endOperation(handle, { success: false, error: { code: "NOT_FOUND", message: "missing" } });

    const logs = drainLogEntries();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      success: false,
      errorCode: "NOT_FOUND",
      errorMessage: "missing",
    });
  });

  it("computes duration from start to end", async () => {
    vi.useFakeTimers();
    const { beginOperation, endOperation } = await import("./operation-log");

    const handle = beginOperation({ useCase: "example.write-thing", actor: { id: "u1", type: "user" }, kind: "write" });
    vi.advanceTimersByTime(120);
    endOperation(handle, { success: true });
    vi.useRealTimers();

    expect(drainLogEntries()[0].durationMs).toBe(120);
  });

  it("always traces a failed operation regardless of sample rate", async () => {
    vi.stubEnv("OBSERVABILITY_TRACE_SAMPLE_RATE", "0");
    const { beginOperation, endOperation } = await import("./operation-log");

    const handle = beginOperation({ useCase: "example.read-thing", actor: { id: "u1", type: "user" }, kind: "read" });
    endOperation(handle, { success: false, error: { code: "BOOM", message: "boom" } });

    expect(drainTraceEntries()).toHaveLength(1);
  });

  it("traces a successful operation only when sampled", async () => {
    vi.stubEnv("OBSERVABILITY_TRACE_SAMPLE_RATE", "0.5");
    vi.spyOn(Math, "random").mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);
    const { beginOperation, endOperation } = await import("./operation-log");

    const notSampled = beginOperation({ useCase: "example.write-thing", actor: { id: "u1", type: "user" }, kind: "write" });
    endOperation(notSampled, { success: true });
    expect(drainTraceEntries()).toHaveLength(0);

    const sampled = beginOperation({ useCase: "example.write-thing", actor: { id: "u1", type: "user" }, kind: "write" });
    endOperation(sampled, { success: true });
    expect(drainTraceEntries()).toHaveLength(1);
  });
});
