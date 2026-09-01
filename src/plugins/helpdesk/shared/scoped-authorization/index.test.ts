import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const findQueueMemberRole = vi.fn();
const findQueueIdsForUser = vi.fn();
const findQueueIdByCategoryId = vi.fn();
vi.mock("./store", () => ({
  findQueueMemberRole: (...args: unknown[]) => findQueueMemberRole(...args),
  findQueueIdsForUser: (...args: unknown[]) => findQueueIdsForUser(...args),
  findQueueIdByCategoryId: (...args: unknown[]) => findQueueIdByCategoryId(...args),
  findQueueById: vi.fn(),
  roleSatisfies: vi.fn(),
}));

const OK = (actorId: string) => ({ authorized: true as const, actorId });
const NO = { authorized: false as const, error: { code: "rbac.authorization.forbidden", message: "no" } };

describe("authorizeQueueConfigActor", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    findQueueMemberRole.mockReset();
  });

  it("passes straight through for helpdesk.manage", async () => {
    authorizeActor.mockResolvedValueOnce(OK("boss"));
    const { authorizeQueueConfigActor } = await import("./index");

    const result = await authorizeQueueConfigActor("q1");

    expect(result).toEqual(OK("boss"));
    expect(findQueueMemberRole).not.toHaveBeenCalled();
  });

  it("requires helpdesk.work AND a manager row on the queue", async () => {
    authorizeActor.mockResolvedValueOnce(NO).mockResolvedValueOnce(OK("tech"));
    findQueueMemberRole.mockResolvedValue("agent");
    const { authorizeQueueConfigActor } = await import("./index");

    const result = await authorizeQueueConfigActor("q1");

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.error.code).toBe("helpdesk.queue.forbidden_resource");
  });

  it("allows a queue manager (helpdesk.work + manager row)", async () => {
    authorizeActor.mockResolvedValueOnce(NO).mockResolvedValueOnce(OK("tech"));
    findQueueMemberRole.mockResolvedValue("manager");
    const { authorizeQueueConfigActor } = await import("./index");

    const result = await authorizeQueueConfigActor("q1");

    expect(result).toEqual(OK("tech"));
  });

  it("rejects when the actor lacks helpdesk.work too", async () => {
    authorizeActor.mockResolvedValueOnce(NO).mockResolvedValueOnce(NO);
    const { authorizeQueueConfigActor } = await import("./index");

    const result = await authorizeQueueConfigActor("q1");

    expect(result).toEqual(NO);
  });
});

describe("resolveVisibleQueues", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    findQueueIdsForUser.mockReset();
  });

  it("is 'all' for manage/read", async () => {
    authorizeActor.mockResolvedValueOnce(OK("boss"));
    const { resolveVisibleQueues } = await import("./index");

    expect(await resolveVisibleQueues()).toEqual({ scope: "all" });
  });

  it("is scoped to member queues for helpdesk.work only", async () => {
    authorizeActor.mockResolvedValueOnce(NO).mockResolvedValueOnce(OK("tech"));
    findQueueIdsForUser.mockResolvedValue(["q1", "q2"]);
    const { resolveVisibleQueues } = await import("./index");

    expect(await resolveVisibleQueues()).toEqual({ scope: "scoped", queueIds: ["q1", "q2"] });
  });

  it("is 'none' without any helpdesk permission", async () => {
    authorizeActor.mockResolvedValueOnce(NO).mockResolvedValueOnce(NO);
    const { resolveVisibleQueues } = await import("./index");

    expect(await resolveVisibleQueues()).toEqual({ scope: "none" });
  });
});

describe("authorizeCategoryConfigActor", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    findQueueIdByCategoryId.mockReset();
    findQueueMemberRole.mockReset();
  });

  it("404s when the category has no parent queue", async () => {
    findQueueIdByCategoryId.mockResolvedValue(null);
    const { authorizeCategoryConfigActor } = await import("./index");

    const result = await authorizeCategoryConfigActor("missing");

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.error.code).toBe("helpdesk.category.not_found");
  });

  it("delegates to the queue config gate once the parent is resolved", async () => {
    findQueueIdByCategoryId.mockResolvedValue("q1");
    authorizeActor.mockResolvedValueOnce(OK("boss"));
    const { authorizeCategoryConfigActor } = await import("./index");

    const result = await authorizeCategoryConfigActor("c1");

    expect(result).toEqual(OK("boss"));
  });
});
