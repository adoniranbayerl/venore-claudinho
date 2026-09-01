import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
vi.mock("@/contexts/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

const findTicketForReopen = vi.fn();
vi.mock("./store", () => ({
  findTicketForReopen: (...args: unknown[]) => findTicketForReopen(...args),
}));

const reopenTicket = vi.fn();
vi.mock("./service", () => ({
  reopenTicket: (...args: unknown[]) => reopenTicket(...args),
}));

const TICKET = {
  id: "t1",
  queueId: "q1",
  status: "resolved",
  requesterUserId: "u-owner",
  requesterName: null,
  resolvedAt: new Date("2026-09-01T00:00:00Z"),
  reopenedCount: 0,
};

describe("reopenTicketHandler", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    findTicketForReopen.mockReset().mockResolvedValue(TICKET);
    reopenTicket.mockReset().mockResolvedValue({ success: true, data: { id: "t1" } });
  });

  it("401s without a session, before any lookup", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });
    const { reopenTicketHandler } = await import("./handler");
    const result = await reopenTicketHandler({ ticketId: "t1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.reopen-ticket.unauthenticated");
    expect(findTicketForReopen).not.toHaveBeenCalled();
  });

  it("forbids anyone who is not the ticket's requester", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "someone-else" } });
    const { reopenTicketHandler } = await import("./handler");
    const result = await reopenTicketHandler({ ticketId: "t1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.reopen-ticket.forbidden");
    expect(reopenTicket).not.toHaveBeenCalled();
  });

  it("delegates to the service for the requester, passing the session user as author", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "u-owner" } });
    const { reopenTicketHandler } = await import("./handler");
    const result = await reopenTicketHandler({ ticketId: "t1", note: "voltou a falhar" });

    expect(result.success).toBe(true);
    expect(reopenTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "t1",
        queueId: "q1",
        status: "resolved",
        actorUserId: "u-owner",
        authorLabel: null,
        note: "voltou a falhar",
      }),
    );
  });
});
