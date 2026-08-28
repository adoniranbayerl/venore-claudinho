import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const authorizeSectorConfigActor = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  authorizeSectorConfigActor: (...args: unknown[]) => authorizeSectorConfigActor(...args),
}));

const setSectorMembers = vi.fn();
vi.mock("./service", () => ({
  setSectorMembers: (...args: unknown[]) => setSectorMembers(...args),
}));

const FORBIDDEN = { authorized: false as const, error: { code: "rbac.authorization.forbidden", message: "no" } };
const input = { sectorId: "s1", members: [{ userId: "u1", role: "editor" as const }] };

describe("setSectorMembersHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    authorizeSectorConfigActor.mockReset();
    setSectorMembers.mockReset();
    setSectorMembers.mockResolvedValue({ success: true, data: { sectorId: "s1", members: input.members } });
  });

  it("rejects a blank sectorId before touching authorization", async () => {
    const { setSectorMembersHandler } = await import("./handler");
    const result = await setSectorMembersHandler({ sectorId: "  ", members: [] });

    expect(result.success).toBe(false);
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("calls the service with canManageAdmins=true for company-metrics.manage", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "boss" });

    const { setSectorMembersHandler } = await import("./handler");
    await setSectorMembersHandler(input);

    expect(setSectorMembers).toHaveBeenCalledWith({ ...input, canManageAdmins: true, actorId: "boss" });
    expect(authorizeSectorConfigActor).not.toHaveBeenCalled();
  });

  it("falls back to sector-admin gate with canManageAdmins=false", async () => {
    authorizeActor.mockResolvedValue(FORBIDDEN);
    authorizeSectorConfigActor.mockResolvedValue({ authorized: true, actorId: "sadmin" });

    const { setSectorMembersHandler } = await import("./handler");
    await setSectorMembersHandler(input);

    expect(authorizeSectorConfigActor).toHaveBeenCalledWith("s1");
    expect(setSectorMembers).toHaveBeenCalledWith({ ...input, canManageAdmins: false, actorId: "sadmin" });
  });

  it("rejects when neither gate passes", async () => {
    authorizeActor.mockResolvedValue(FORBIDDEN);
    authorizeSectorConfigActor.mockResolvedValue(FORBIDDEN);

    const { setSectorMembersHandler } = await import("./handler");
    const result = await setSectorMembersHandler(input);

    expect(result).toEqual({ success: false, error: FORBIDDEN.error });
    expect(setSectorMembers).not.toHaveBeenCalled();
  });
});
