import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const createQueue = vi.fn();
vi.mock("./service", () => ({
  createQueue: (...args: unknown[]) => createQueue(...args),
}));

describe("createQueueHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    createQueue.mockReset();
    createQueue.mockResolvedValue({ success: true, data: { id: "q1" } });
  });

  it("rejects a blank name before touching authorization", async () => {
    const { createQueueHandler } = await import("./handler");
    const result = await createQueueHandler({ name: "   " });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.create-queue.invalid_name");
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("403s without helpdesk.manage", async () => {
    authorizeActor.mockResolvedValue({ authorized: false, error: { code: "rbac.authorization.forbidden", message: "no" } });

    const { createQueueHandler } = await import("./handler");
    const result = await createQueueHandler({ name: "TI" });

    expect(result.success).toBe(false);
    expect(createQueue).not.toHaveBeenCalled();
  });

  it("passes the actorId through on success", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "boss" });

    const { createQueueHandler } = await import("./handler");
    await createQueueHandler({ name: "TI", description: null, icon: null });

    expect(authorizeActor).toHaveBeenCalledWith("helpdesk.manage");
    expect(createQueue).toHaveBeenCalledWith({ name: "TI", description: null, icon: null, actorId: "boss" });
  });
});
