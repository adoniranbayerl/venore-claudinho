import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TicketActorCapabilities } from "../../../shared/ticket-state";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

vi.mock("../../../shared/notify", () => ({ notify: vi.fn() }));

const applyStatusChange = vi.fn();
vi.mock("./store", () => ({
  applyStatusChange: (...args: unknown[]) => applyStatusChange(...args),
}));

const ASSIGNEE: TicketActorCapabilities = {
  hasManagePermission: false,
  isQueueManager: false,
  isAssignee: true,
  isQueueMember: true,
};
const AGENT: TicketActorCapabilities = { ...ASSIGNEE, isAssignee: false };
const ADMIN: TicketActorCapabilities = { ...AGENT, isQueueMember: false, hasManagePermission: true };

describe("changeStatus", () => {
  beforeEach(() => {
    applyStatusChange.mockReset();
    applyStatusChange.mockImplementation(async (input: Record<string, unknown>) => ({ id: "t1", status: input.to }));
  });

  it("lets the assignee resolve and stamps resolvedAt", async () => {
    const { changeStatus } = await import("./service");
    const result = await changeStatus(
      { ticketId: "t1", to: "resolved", note: null, actorId: "u1" },
      { currentStatus: "in_progress", capabilities: ASSIGNEE },
    );

    expect(result.success).toBe(true);
    expect(applyStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ from: "in_progress", to: "resolved", resolvedAt: expect.any(Date) }),
    );
  });

  it("blocks a plain agent from resolving", async () => {
    const { changeStatus } = await import("./service");
    const result = await changeStatus(
      { ticketId: "t1", to: "resolved", note: null, actorId: "u1" },
      { currentStatus: "in_progress", capabilities: AGENT },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.change-status.resolve_forbidden");
    expect(applyStatusChange).not.toHaveBeenCalled();
  });

  it("blocks a queue manager from closing but lets helpdesk.manage close", async () => {
    const { changeStatus } = await import("./service");

    const denied = await changeStatus(
      { ticketId: "t1", to: "closed", note: null, actorId: "u1" },
      { currentStatus: "resolved", capabilities: { ...AGENT, isQueueManager: true } },
    );
    expect(denied.success).toBe(false);
    if (!denied.success) expect(denied.error.code).toBe("helpdesk.change-status.close_forbidden");

    const allowed = await changeStatus(
      { ticketId: "t1", to: "closed", note: null, actorId: "boss" },
      { currentStatus: "resolved", capabilities: ADMIN },
    );
    expect(allowed.success).toBe(true);
    expect(applyStatusChange).toHaveBeenCalledWith(expect.objectContaining({ to: "closed", closedAt: expect.any(Date) }));
  });

  it("rejects an impossible transition", async () => {
    const { changeStatus } = await import("./service");
    const result = await changeStatus(
      { ticketId: "t1", to: "closed", note: null, actorId: "boss" },
      { currentStatus: "open", capabilities: ADMIN },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.change-status.invalid_transition");
  });
});
