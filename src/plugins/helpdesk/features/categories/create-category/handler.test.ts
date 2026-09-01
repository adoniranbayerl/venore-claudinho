import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeQueueConfigActor = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  authorizeQueueConfigActor: (...args: unknown[]) => authorizeQueueConfigActor(...args),
}));

const createCategory = vi.fn();
vi.mock("./service", () => ({
  createCategory: (...args: unknown[]) => createCategory(...args),
}));

describe("createCategoryHandler", () => {
  beforeEach(() => {
    authorizeQueueConfigActor.mockReset();
    createCategory.mockReset();
    createCategory.mockResolvedValue({ success: true, data: { id: "c1" } });
  });

  it("rejects a blank label before touching authorization", async () => {
    const { createCategoryHandler } = await import("./handler");
    const result = await createCategoryHandler({ queueId: "q1", label: "  " });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.create-category.invalid_label");
    expect(authorizeQueueConfigActor).not.toHaveBeenCalled();
  });

  it("403s when the actor cannot configure the queue", async () => {
    authorizeQueueConfigActor.mockResolvedValue({
      authorized: false,
      error: { code: "helpdesk.queue.forbidden_resource", message: "no" },
    });

    const { createCategoryHandler } = await import("./handler");
    const result = await createCategoryHandler({ queueId: "q1", label: "Rede" });

    expect(result.success).toBe(false);
    expect(createCategory).not.toHaveBeenCalled();
  });

  it("passes the resolved actorId through on success", async () => {
    authorizeQueueConfigActor.mockResolvedValue({ authorized: true, actorId: "mgr" });

    const { createCategoryHandler } = await import("./handler");
    await createCategoryHandler({ queueId: "q1", label: "Rede", description: null });

    expect(authorizeQueueConfigActor).toHaveBeenCalledWith("q1");
    expect(createCategory).toHaveBeenCalledWith({ queueId: "q1", label: "Rede", description: null, actorId: "mgr" });
  });
});
