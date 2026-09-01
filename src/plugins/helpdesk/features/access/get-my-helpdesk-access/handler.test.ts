import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const buildAccessForActor = vi.fn();
vi.mock("./service", () => ({
  buildAccessForActor: (...args: unknown[]) => buildAccessForActor(...args),
}));

const NO = { authorized: false as const, error: { code: "rbac.authorization.forbidden", message: "no" } };
const OK = (actorId: string) => ({ authorized: true as const, actorId });

describe("getMyHelpdeskAccessHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    buildAccessForActor.mockReset();
    buildAccessForActor.mockResolvedValue({ canManageAll: false, canReadAll: false, managerQueueIds: [], memberQueueIds: [] });
  });

  it("403s when the actor has none of the three permissions", async () => {
    authorizeActor.mockResolvedValue(NO);

    const { getMyHelpdeskAccessHandler } = await import("./handler");
    const result = await getMyHelpdeskAccessHandler();

    expect(result.success).toBe(false);
    expect(buildAccessForActor).not.toHaveBeenCalled();
  });

  it("marks canManageAll and canReadAll for helpdesk.manage", async () => {
    authorizeActor.mockImplementation(async (perm: string) => (perm === "helpdesk.manage" ? OK("boss") : NO));

    const { getMyHelpdeskAccessHandler } = await import("./handler");
    await getMyHelpdeskAccessHandler();

    expect(buildAccessForActor).toHaveBeenCalledWith("boss", { canManageAll: true, canReadAll: true });
  });

  it("marks only canReadAll for helpdesk.read", async () => {
    authorizeActor.mockImplementation(async (perm: string) => (perm === "helpdesk.read" ? OK("lead") : NO));

    const { getMyHelpdeskAccessHandler } = await import("./handler");
    await getMyHelpdeskAccessHandler();

    expect(buildAccessForActor).toHaveBeenCalledWith("lead", { canManageAll: false, canReadAll: true });
  });

  it("grants a technician (helpdesk.work) without either broad flag", async () => {
    authorizeActor.mockImplementation(async (perm: string) => (perm === "helpdesk.work" ? OK("tech") : NO));

    const { getMyHelpdeskAccessHandler } = await import("./handler");
    await getMyHelpdeskAccessHandler();

    expect(buildAccessForActor).toHaveBeenCalledWith("tech", { canManageAll: false, canReadAll: false });
  });
});
