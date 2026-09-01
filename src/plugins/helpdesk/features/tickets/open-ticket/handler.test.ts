import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
vi.mock("@/contexts/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

const openTicket = vi.fn();
vi.mock("./service", () => ({
  openTicket: (...args: unknown[]) => openTicket(...args),
}));

describe("openTicketHandler", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    openTicket.mockReset();
    openTicket.mockResolvedValue({ success: true, data: { ticket: { id: "t1" }, reference: "ti-1" } });
  });

  it("rejects a blank title before touching the session", async () => {
    const { openTicketHandler } = await import("./handler");
    const result = await openTicketHandler({ queueId: "q1", title: "  ", description: "y" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.open-ticket.invalid_title");
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("401s when there is no session", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });

    const { openTicketHandler } = await import("./handler");
    const result = await openTicketHandler({ queueId: "q1", title: "Ajuda", description: "algo" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.open-ticket.unauthenticated");
    expect(openTicket).not.toHaveBeenCalled();
  });

  it("passes the session user as requesterUserId", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "u9" } });

    const { openTicketHandler } = await import("./handler");
    await openTicketHandler({ queueId: "q1", title: "Ajuda", description: "algo", location: null });

    expect(openTicket).toHaveBeenCalledWith(
      expect.objectContaining({ queueId: "q1", title: "Ajuda", description: "algo", requesterUserId: "u9" }),
    );
  });
});
