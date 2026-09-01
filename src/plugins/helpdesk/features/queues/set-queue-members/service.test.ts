import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const findQueueById = vi.fn();
const findManagerUserIds = vi.fn();
const replaceQueueMembers = vi.fn();
vi.mock("./store", () => ({
  findQueueById: (...args: unknown[]) => findQueueById(...args),
  findManagerUserIds: (...args: unknown[]) => findManagerUserIds(...args),
  replaceQueueMembers: (...args: unknown[]) => replaceQueueMembers(...args),
}));

describe("setQueueMembers", () => {
  beforeEach(() => {
    findQueueById.mockReset();
    findManagerUserIds.mockReset();
    replaceQueueMembers.mockReset();
    findQueueById.mockResolvedValue({ id: "q1", name: "TI" });
    findManagerUserIds.mockResolvedValue(["boss"]);
  });

  it("fails when the queue does not exist", async () => {
    findQueueById.mockResolvedValue(null);

    const { setQueueMembers } = await import("./service");
    const result = await setQueueMembers({ queueId: "missing", members: [], canManageManagers: true, actorId: "a1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.set-queue-members.not_found");
  });

  it("rejects a duplicated user", async () => {
    const { setQueueMembers } = await import("./service");
    const result = await setQueueMembers({
      queueId: "q1",
      members: [
        { userId: "u1", role: "agent" },
        { userId: "u1", role: "manager" },
      ],
      canManageManagers: true,
      actorId: "a1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.set-queue-members.duplicate_user");
    expect(replaceQueueMembers).not.toHaveBeenCalled();
  });

  it("lets a full manager replace the whole set including managers", async () => {
    const { setQueueMembers } = await import("./service");
    const result = await setQueueMembers({
      queueId: "q1",
      members: [
        { userId: "boss2", role: "manager" },
        { userId: "u1", role: "agent" },
      ],
      canManageManagers: true,
      actorId: "a1",
    });

    expect(result.success).toBe(true);
    expect(replaceQueueMembers).toHaveBeenCalledWith("q1", [
      { userId: "boss2", role: "manager" },
      { userId: "u1", role: "agent" },
    ]);
  });

  it("blocks a queue manager (no manage) from changing the manager set", async () => {
    findManagerUserIds.mockResolvedValue(["boss"]);

    const { setQueueMembers } = await import("./service");
    const result = await setQueueMembers({
      queueId: "q1",
      members: [
        { userId: "boss", role: "manager" },
        { userId: "intruder", role: "manager" },
        { userId: "u1", role: "agent" },
      ],
      canManageManagers: false,
      actorId: "a1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.set-queue-members.manager_change_forbidden");
    expect(replaceQueueMembers).not.toHaveBeenCalled();
  });

  it("lets a queue manager change agents while keeping the manager set intact", async () => {
    findManagerUserIds.mockResolvedValue(["boss"]);

    const { setQueueMembers } = await import("./service");
    const result = await setQueueMembers({
      queueId: "q1",
      members: [
        { userId: "boss", role: "manager" },
        { userId: "u9", role: "agent" },
      ],
      canManageManagers: false,
      actorId: "a1",
    });

    expect(result.success).toBe(true);
    expect(replaceQueueMembers).toHaveBeenCalled();
  });
});
