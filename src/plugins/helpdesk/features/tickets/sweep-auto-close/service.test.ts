import { beforeEach, describe, expect, it, vi } from "vitest";
import { TICKET_AUTO_CLOSE_DAYS } from "../../../shared/ticket-state";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const notify = vi.fn();
vi.mock("../../../shared/notify", () => ({ notify: (...args: unknown[]) => notify(...args) }));

const findResolvedTicketsPastAutoClose = vi.fn();
const applyAutoClose = vi.fn();
vi.mock("./store", () => ({
  findResolvedTicketsPastAutoClose: (...args: unknown[]) => findResolvedTicketsPastAutoClose(...args),
  applyAutoClose: (...args: unknown[]) => applyAutoClose(...args),
}));

describe("sweepAutoClose", () => {
  beforeEach(() => {
    notify.mockReset();
    findResolvedTicketsPastAutoClose.mockReset();
    applyAutoClose.mockReset();
  });

  it("does nothing when there are no candidates", async () => {
    findResolvedTicketsPastAutoClose.mockResolvedValue([]);
    const { sweepAutoClose } = await import("./service");
    const result = await sweepAutoClose();

    expect(result).toEqual({ success: true, data: { closed: 0 } });
    expect(applyAutoClose).not.toHaveBeenCalled();
  });

  it("queries with a cutoff N days before now", async () => {
    findResolvedTicketsPastAutoClose.mockResolvedValue([]);
    const now = new Date("2026-09-20T12:00:00Z");
    const { sweepAutoClose } = await import("./service");
    await sweepAutoClose(now);

    const cutoff = findResolvedTicketsPastAutoClose.mock.calls[0][0] as Date;
    expect(cutoff.toISOString()).toBe(
      new Date(now.getTime() - TICKET_AUTO_CLOSE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    );
  });

  it("counts only the tickets the store actually closed and notifies their requesters", async () => {
    findResolvedTicketsPastAutoClose.mockResolvedValue([
      { id: "t1", queueId: "q1" },
      { id: "t2", queueId: "q1" },
      { id: "t3", queueId: "q2" },
    ]);
    // t2 was reopened between the query and the update — store returns false for it.
    applyAutoClose.mockImplementation(async (id: string) => id !== "t2");

    const { sweepAutoClose } = await import("./service");
    const result = await sweepAutoClose();

    expect(result).toEqual({ success: true, data: { closed: 2 } });
    expect(notify).toHaveBeenCalledTimes(2);
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: "t1", kind: "status_changed", audiences: ["requester"] }),
    );
    expect(notify).not.toHaveBeenCalledWith(expect.objectContaining({ ticketId: "t2" }));
  });
});
