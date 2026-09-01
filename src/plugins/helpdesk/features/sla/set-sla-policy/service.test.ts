import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const findQueueById = vi.fn();
vi.mock("../../../shared/scoped-authorization/store", () => ({
  findQueueById: (...args: unknown[]) => findQueueById(...args),
}));

const upsertSlaPolicy = vi.fn();
vi.mock("../../../shared/sla-policy-store", () => ({
  upsertSlaPolicy: (...args: unknown[]) => upsertSlaPolicy(...args),
}));

describe("setSlaPolicy", () => {
  beforeEach(() => {
    findQueueById.mockReset();
    upsertSlaPolicy.mockReset();
    upsertSlaPolicy.mockImplementation(async (input: Record<string, unknown>) => ({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it("rejects when the queue does not exist", async () => {
    findQueueById.mockResolvedValue(null);
    const { setSlaPolicy } = await import("./service");
    const result = await setSlaPolicy({
      queueId: "missing",
      priority: "high",
      firstResponseMinutes: 30,
      resolutionMinutes: 480,
      actorId: "boss",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.set-sla-policy.queue_not_found");
    expect(upsertSlaPolicy).not.toHaveBeenCalled();
  });

  it("upserts the policy for the (queue, priority) pair", async () => {
    findQueueById.mockResolvedValue({ id: "q1", name: "Manutenção" });
    const { setSlaPolicy } = await import("./service");
    const result = await setSlaPolicy({
      queueId: "q1",
      priority: "urgent",
      firstResponseMinutes: 15,
      resolutionMinutes: 240,
      actorId: "boss",
    });
    expect(result.success).toBe(true);
    expect(upsertSlaPolicy).toHaveBeenCalledWith({
      queueId: "q1",
      priority: "urgent",
      firstResponseMinutes: 15,
      resolutionMinutes: 240,
    });
  });
});
