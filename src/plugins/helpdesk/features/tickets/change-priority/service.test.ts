import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const notifySlaAtRiskForTicket = vi.fn();
vi.mock("../../../shared/notify", () => ({
  notifySlaAtRiskForTicket: (...args: unknown[]) => notifySlaAtRiskForTicket(...args),
}));

const resolveResolutionMinutes = vi.fn();
vi.mock("../../../shared/sla-policy-store", () => ({
  resolveResolutionMinutes: (...args: unknown[]) => resolveResolutionMinutes(...args),
}));

const applyPriorityChange = vi.fn();
vi.mock("./store", () => ({
  applyPriorityChange: (...args: unknown[]) => applyPriorityChange(...args),
}));

describe("changePriority", () => {
  beforeEach(() => {
    notifySlaAtRiskForTicket.mockReset();
    resolveResolutionMinutes.mockReset();
    applyPriorityChange.mockReset();
    resolveResolutionMinutes.mockResolvedValue(240); // 4 h
    applyPriorityChange.mockImplementation(async (input: Record<string, unknown>) => ({
      id: "t1",
      queueId: "q1",
      priority: input.to,
      slaDueAt: input.slaDueAt,
      resolvedAt: null,
      createdAt: new Date("2026-09-01T00:00:00.000Z"),
    }));
  });

  it("rejects a no-op (same priority)", async () => {
    const { changePriority } = await import("./service");
    const result = await changePriority(
      { ticketId: "t1", to: "normal", actorId: "boss" },
      { queueId: "q1", currentPriority: "normal" },
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.change-priority.noop");
    expect(applyPriorityChange).not.toHaveBeenCalled();
  });

  it("rejects an invalid priority", async () => {
    const { changePriority } = await import("./service");
    const result = await changePriority(
      { ticketId: "t1", to: "critical" as never, actorId: "boss" },
      { queueId: "q1", currentPriority: "normal" },
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.change-priority.invalid_priority");
  });

  it("recomputes sla_due_at from the policy of the NEW priority (now + resolution_minutes)", async () => {
    const before = Date.now();
    const { changePriority } = await import("./service");
    const result = await changePriority(
      { ticketId: "t1", to: "urgent", actorId: "boss" },
      { queueId: "q1", currentPriority: "normal" },
    );
    const after = Date.now();

    expect(result.success).toBe(true);
    expect(resolveResolutionMinutes).toHaveBeenCalledWith("q1", "urgent");
    const call = applyPriorityChange.mock.calls[0][0] as { from: string; to: string; slaDueAt: Date };
    expect(call.from).toBe("normal");
    expect(call.to).toBe("urgent");
    const due = call.slaDueAt.getTime();
    expect(due).toBeGreaterThanOrEqual(before + 240 * 60_000);
    expect(due).toBeLessThanOrEqual(after + 240 * 60_000);
  });

  it("checks the SLA-at-risk alert after recomputing", async () => {
    const { changePriority } = await import("./service");
    await changePriority(
      { ticketId: "t1", to: "high", actorId: "boss" },
      { queueId: "q1", currentPriority: "low" },
    );
    expect(notifySlaAtRiskForTicket).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t1", queueId: "q1" }),
    );
  });
});
