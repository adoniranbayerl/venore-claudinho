import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveVisibleQueues = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  resolveVisibleQueues: (...args: unknown[]) => resolveVisibleQueues(...args),
}));

const listQueues = vi.fn();
vi.mock("./service", () => ({
  listQueues: (...args: unknown[]) => listQueues(...args),
}));

describe("listQueuesHandler", () => {
  beforeEach(() => {
    resolveVisibleQueues.mockReset();
    listQueues.mockReset();
    listQueues.mockResolvedValue({ success: true, data: [] });
  });

  it("403s when the actor has no plugin permission", async () => {
    resolveVisibleQueues.mockResolvedValue({ scope: "none" });

    const { listQueuesHandler } = await import("./handler");
    const result = await listQueuesHandler();

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.list-queues.forbidden");
    expect(listQueues).not.toHaveBeenCalled();
  });

  it("does not pass allowedQueueIds for a full manager/reader", async () => {
    resolveVisibleQueues.mockResolvedValue({ scope: "all" });

    const { listQueuesHandler } = await import("./handler");
    await listQueuesHandler({ includeArchived: true });

    expect(listQueues).toHaveBeenCalledWith({ includeArchived: true, allowedQueueIds: undefined });
  });

  it("passes the assigned queue ids for a technician", async () => {
    resolveVisibleQueues.mockResolvedValue({ scope: "scoped", queueIds: ["q1"] });

    const { listQueuesHandler } = await import("./handler");
    await listQueuesHandler();

    expect(listQueues).toHaveBeenCalledWith({ includeArchived: undefined, allowedQueueIds: ["q1"] });
  });
});
