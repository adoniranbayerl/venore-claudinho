import { beforeEach, describe, expect, it, vi } from "vitest";

const findEvents = vi.fn();

vi.mock("./store", () => ({
  findEvents: (...args: unknown[]) => findEvents(...args),
}));

describe("listEvents", () => {
  beforeEach(() => {
    findEvents.mockReset();
  });

  it("forwards level/origin/actor/period filters to the store untouched", async () => {
    findEvents.mockResolvedValue({ entries: [], hasMore: false });
    const { listEvents } = await import("./service");

    const from = new Date("2026-07-01T00:00:00.000Z");
    const to = new Date("2026-07-30T00:00:00.000Z");
    await listEvents({ level: "error", origin: "context:rbac", actorId: "u1", outcome: "failure", from, to });

    expect(findEvents).toHaveBeenCalledWith({
      level: "error",
      origin: "context:rbac",
      actorId: "u1",
      outcome: "failure",
      from,
      to,
    });
  });

  it("returns entries and hasMore wrapped as a successful OperationResult", async () => {
    const entries = [{ id: "e1" }];
    findEvents.mockResolvedValue({ entries, hasMore: true });
    const { listEvents } = await import("./service");

    const result = await listEvents();

    expect(result).toEqual({ success: true, data: { entries, hasMore: true } });
  });
});
