import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

vi.mock("../../../shared/notify", () => ({ notify: vi.fn() }));

const isQueueMember = vi.fn();
const applyAssignment = vi.fn();
vi.mock("./store", () => ({
  isQueueMember: (...args: unknown[]) => isQueueMember(...args),
  applyAssignment: (...args: unknown[]) => applyAssignment(...args),
}));

describe("assignTicket", () => {
  beforeEach(() => {
    isQueueMember.mockReset();
    applyAssignment.mockReset();
    applyAssignment.mockImplementation(async (input: Record<string, unknown>) => ({ id: "t1", assigneeUserId: input.to }));
  });

  it("assigns to a queue member and records the assignment event", async () => {
    isQueueMember.mockResolvedValue(true);

    const { assignTicket } = await import("./service");
    const result = await assignTicket(
      { ticketId: "t1", assigneeUserId: "tech-9", actorId: "boss" },
      { queueId: "q1", currentAssigneeUserId: null },
    );

    expect(result.success).toBe(true);
    expect(applyAssignment).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: "t1", from: null, to: "tech-9", actorId: "boss" }),
    );
  });

  it("refuses to assign someone who is not on the queue team", async () => {
    isQueueMember.mockResolvedValue(false);

    const { assignTicket } = await import("./service");
    const result = await assignTicket(
      { ticketId: "t1", assigneeUserId: "stranger", actorId: "boss" },
      { queueId: "q1", currentAssigneeUserId: null },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.assign-ticket.not_a_member");
    expect(applyAssignment).not.toHaveBeenCalled();
  });

  it("allows unassigning without a membership check", async () => {
    const { assignTicket } = await import("./service");
    const result = await assignTicket(
      { ticketId: "t1", assigneeUserId: null, actorId: "boss" },
      { queueId: "q1", currentAssigneeUserId: "tech-9" },
    );

    expect(result.success).toBe(true);
    expect(isQueueMember).not.toHaveBeenCalled();
    expect(applyAssignment).toHaveBeenCalledWith(expect.objectContaining({ from: "tech-9", to: null }));
  });

  it("rejects a no-op assignment", async () => {
    const { assignTicket } = await import("./service");
    const result = await assignTicket(
      { ticketId: "t1", assigneeUserId: "tech-9", actorId: "boss" },
      { queueId: "q1", currentAssigneeUserId: "tech-9" },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.assign-ticket.noop");
  });
});
