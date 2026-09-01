import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const authorizeQueueConfigActor = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  authorizeQueueConfigActor: (...args: unknown[]) => authorizeQueueConfigActor(...args),
}));

const setQueueMembers = vi.fn();
vi.mock("./service", () => ({
  setQueueMembers: (...args: unknown[]) => setQueueMembers(...args),
}));

const FORBIDDEN = { authorized: false as const, error: { code: "rbac.authorization.forbidden", message: "no" } };
const input = { queueId: "q1", members: [{ userId: "u1", role: "agent" as const }] };

describe("setQueueMembersHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    authorizeQueueConfigActor.mockReset();
    setQueueMembers.mockReset();
    setQueueMembers.mockResolvedValue({ success: true, data: { queueId: "q1", members: input.members } });
  });

  it("rejects a blank queueId before touching authorization", async () => {
    const { setQueueMembersHandler } = await import("./handler");
    const result = await setQueueMembersHandler({ queueId: "  ", members: [] });

    expect(result.success).toBe(false);
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("calls the service with canManageManagers=true for helpdesk.manage", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "boss" });

    const { setQueueMembersHandler } = await import("./handler");
    await setQueueMembersHandler(input);

    expect(setQueueMembers).toHaveBeenCalledWith({ ...input, canManageManagers: true, actorId: "boss" });
    expect(authorizeQueueConfigActor).not.toHaveBeenCalled();
  });

  it("falls back to the queue-manager gate with canManageManagers=false", async () => {
    authorizeActor.mockResolvedValue(FORBIDDEN);
    authorizeQueueConfigActor.mockResolvedValue({ authorized: true, actorId: "mgr" });

    const { setQueueMembersHandler } = await import("./handler");
    await setQueueMembersHandler(input);

    expect(authorizeQueueConfigActor).toHaveBeenCalledWith("q1");
    expect(setQueueMembers).toHaveBeenCalledWith({ ...input, canManageManagers: false, actorId: "mgr" });
  });

  it("rejects when neither gate passes", async () => {
    authorizeActor.mockResolvedValue(FORBIDDEN);
    authorizeQueueConfigActor.mockResolvedValue(FORBIDDEN);

    const { setQueueMembersHandler } = await import("./handler");
    const result = await setQueueMembersHandler(input);

    expect(result).toEqual({ success: false, error: FORBIDDEN.error });
    expect(setQueueMembers).not.toHaveBeenCalled();
  });
});
