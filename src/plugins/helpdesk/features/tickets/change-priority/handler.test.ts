import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveTicketWorkActor = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  resolveTicketWorkActor: (...args: unknown[]) => resolveTicketWorkActor(...args),
}));

const changePriority = vi.fn();
vi.mock("./service", () => ({
  changePriority: (...args: unknown[]) => changePriority(...args),
}));

describe("changePriorityHandler", () => {
  beforeEach(() => {
    resolveTicketWorkActor.mockReset();
    changePriority.mockReset();
    changePriority.mockResolvedValue({ success: true, data: { id: "t1" } });
  });

  it("rejects an invalid priority before touching authorization", async () => {
    const { changePriorityHandler } = await import("./handler");
    const result = await changePriorityHandler({ ticketId: "t1", priority: "critical" as never });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.change-priority.invalid_priority");
    expect(resolveTicketWorkActor).not.toHaveBeenCalled();
  });

  it("propagates the authorization error from resolveTicketWorkActor", async () => {
    resolveTicketWorkActor.mockResolvedValue({
      authorized: false,
      error: { code: "helpdesk.queue.forbidden_resource", message: "nope" },
    });

    const { changePriorityHandler } = await import("./handler");
    const result = await changePriorityHandler({ ticketId: "t1", priority: "high" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.queue.forbidden_resource");
    expect(changePriority).not.toHaveBeenCalled();
  });

  it("passes the resolved queue + current priority to the service", async () => {
    resolveTicketWorkActor.mockResolvedValue({
      authorized: true,
      actorId: "tech-1",
      ticket: { id: "t1", queueId: "q1", priority: "low" },
      capabilities: {},
    });

    const { changePriorityHandler } = await import("./handler");
    await changePriorityHandler({ ticketId: "t1", priority: "urgent" });

    expect(changePriority).toHaveBeenCalledWith(
      { ticketId: "t1", to: "urgent", actorId: "tech-1" },
      { queueId: "q1", currentPriority: "low" },
    );
  });
});
