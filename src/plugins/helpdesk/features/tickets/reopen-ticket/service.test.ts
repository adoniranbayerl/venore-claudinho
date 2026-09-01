import { beforeEach, describe, expect, it, vi } from "vitest";
import { TICKET_REOPEN_WINDOW_DAYS } from "../../../shared/ticket-state";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const notify = vi.fn();
vi.mock("../../../shared/notify", () => ({ notify: (...args: unknown[]) => notify(...args) }));

const applyReopen = vi.fn();
vi.mock("./store", () => ({
  applyReopen: (...args: unknown[]) => applyReopen(...args),
}));

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);

const BASE = {
  ticketId: "t1",
  queueId: "q1",
  status: "resolved" as const,
  resolvedAt: daysAgo(1),
  note: "  ainda quebrado  ",
  actorUserId: "u-requester",
  authorLabel: null,
};

describe("reopenTicket", () => {
  beforeEach(() => {
    notify.mockReset();
    applyReopen.mockReset().mockResolvedValue({ id: "t1", status: "in_progress", reopenedCount: 1 });
  });

  it("reopens inside the window: bumps count via store, writes the reopened event, notifies team", async () => {
    const { reopenTicket } = await import("./service");
    const result = await reopenTicket(BASE);

    expect(result.success).toBe(true);
    expect(applyReopen).toHaveBeenCalledWith({
      ticketId: "t1",
      from: "resolved",
      authorUserId: "u-requester",
      authorLabel: null,
      note: "ainda quebrado",
    });
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "reopened", audiences: ["assignee", "queue"], actorUserId: "u-requester" }),
    );
  });

  it("refuses once the N-day window has passed", async () => {
    const { reopenTicket } = await import("./service");
    const result = await reopenTicket({ ...BASE, resolvedAt: daysAgo(TICKET_REOPEN_WINDOW_DAYS + 1) });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.reopen-ticket.window_expired");
    expect(applyReopen).not.toHaveBeenCalled();
  });

  it("refuses when the ticket is not in a resolved state", async () => {
    const { reopenTicket } = await import("./service");
    const result = await reopenTicket({ ...BASE, status: "closed" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.reopen-ticket.not_reopenable");
    expect(applyReopen).not.toHaveBeenCalled();
  });
});
