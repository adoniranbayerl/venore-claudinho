import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const notify = vi.fn();
vi.mock("../../../shared/notify", () => ({ notify: (...args: unknown[]) => notify(...args) }));

const applyRating = vi.fn();
vi.mock("./store", () => ({
  applyRating: (...args: unknown[]) => applyRating(...args),
}));

const BASE = {
  ticketId: "t1",
  queueId: "q1",
  status: "resolved" as const,
  score: 4,
  comment: "  bom atendimento  ",
  authorUserId: null,
  authorLabel: "Maria",
};

describe("rateTicket", () => {
  beforeEach(() => {
    notify.mockReset();
    applyRating.mockReset().mockResolvedValue(undefined);
  });

  it("rejects a score outside 1..5 without writing", async () => {
    const { rateTicket } = await import("./service");
    for (const score of [0, 6, 2.5]) {
      const result = await rateTicket({ ...BASE, score });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.code).toBe("helpdesk.rate-ticket.invalid_score");
    }
    expect(applyRating).not.toHaveBeenCalled();
  });

  it("rejects rating a ticket that is not resolved/closed", async () => {
    const { rateTicket } = await import("./service");
    const result = await rateTicket({ ...BASE, status: "in_progress" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.rate-ticket.not_resolved");
    expect(applyRating).not.toHaveBeenCalled();
  });

  it("denormalizes the score, trims the comment and notifies the assignee", async () => {
    const { rateTicket } = await import("./service");
    const result = await rateTicket(BASE);

    expect(result).toEqual({ success: true, data: { score: 4 } });
    expect(applyRating).toHaveBeenCalledWith({
      ticketId: "t1",
      score: 4,
      comment: "bom atendimento",
      authorUserId: null,
      authorLabel: "Maria",
    });
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "rating_received", audiences: ["assignee"], ticketId: "t1" }),
    );
  });

  it("accepts a closed ticket too", async () => {
    const { rateTicket } = await import("./service");
    const result = await rateTicket({ ...BASE, status: "closed" });
    expect(result.success).toBe(true);
  });
});
