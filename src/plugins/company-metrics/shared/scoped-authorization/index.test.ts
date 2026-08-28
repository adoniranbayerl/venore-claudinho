import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const findSectorMemberRole = vi.fn();
const findSectorIdsForUser = vi.fn();
const findSectorIdByGroupId = vi.fn();
vi.mock("./store", () => ({
  findSectorMemberRole: (...args: unknown[]) => findSectorMemberRole(...args),
  findSectorIdsForUser: (...args: unknown[]) => findSectorIdsForUser(...args),
  findSectorIdByGroupId: (...args: unknown[]) => findSectorIdByGroupId(...args),
  findSectorById: vi.fn(),
  roleSatisfies: (actual: string | null, min: string) => {
    const rank: Record<string, number> = { viewer: 1, editor: 2, admin: 3 };
    return actual !== null && rank[actual] >= rank[min];
  },
}));

const FORBIDDEN = { authorized: false as const, error: { code: "rbac.authorization.forbidden", message: "forbidden" } };

describe("authorizeSectorActor", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    findSectorMemberRole.mockReset();
  });

  it("passes unconditionally for an actor with company-metrics.manage", async () => {
    authorizeActor.mockImplementation(async (perm: string) =>
      perm === "company-metrics.manage" ? { authorized: true, actorId: "boss" } : FORBIDDEN,
    );

    const { authorizeSectorActor } = await import("./index");
    const result = await authorizeSectorActor("sector-1", "admin");

    expect(result).toEqual({ authorized: true, actorId: "boss" });
    expect(findSectorMemberRole).not.toHaveBeenCalled();
  });

  it("rejects an actor with neither manage nor contribute", async () => {
    authorizeActor.mockResolvedValue(FORBIDDEN);

    const { authorizeSectorActor } = await import("./index");
    const result = await authorizeSectorActor("sector-1", "editor");

    expect(result).toEqual(FORBIDDEN);
    expect(findSectorMemberRole).not.toHaveBeenCalled();
  });

  it("rejects a contributor who is not a member of the sector", async () => {
    authorizeActor.mockImplementation(async (perm: string) =>
      perm === "company-metrics.contribute" ? { authorized: true, actorId: "u1" } : FORBIDDEN,
    );
    findSectorMemberRole.mockResolvedValue(null);

    const { authorizeSectorActor } = await import("./index");
    const result = await authorizeSectorActor("sector-1", "editor");

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.error.code).toBe("company-metrics.sector.forbidden_resource");
  });

  it("rejects a contributor whose role is below the required minimum", async () => {
    authorizeActor.mockImplementation(async (perm: string) =>
      perm === "company-metrics.contribute" ? { authorized: true, actorId: "u1" } : FORBIDDEN,
    );
    findSectorMemberRole.mockResolvedValue("viewer");

    const { authorizeSectorActor } = await import("./index");
    const result = await authorizeSectorActor("sector-1", "editor");

    expect(result.authorized).toBe(false);
  });

  it("passes a contributor whose role meets the minimum", async () => {
    authorizeActor.mockImplementation(async (perm: string) =>
      perm === "company-metrics.contribute" ? { authorized: true, actorId: "u1" } : FORBIDDEN,
    );
    findSectorMemberRole.mockResolvedValue("editor");

    const { authorizeSectorActor } = await import("./index");
    const result = await authorizeSectorActor("sector-1", "editor");

    expect(result).toEqual({ authorized: true, actorId: "u1" });
  });
});

describe("resolveManageableSectors", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    findSectorIdsForUser.mockReset();
  });

  it("returns { scope: all } for company-metrics.manage", async () => {
    authorizeActor.mockImplementation(async (perm: string) =>
      perm === "company-metrics.manage" ? { authorized: true, actorId: "boss" } : FORBIDDEN,
    );

    const { resolveManageableSectors } = await import("./index");
    expect(await resolveManageableSectors()).toEqual({ scope: "all" });
  });

  it("returns the assigned sector ids for a contributor", async () => {
    authorizeActor.mockImplementation(async (perm: string) =>
      perm === "company-metrics.contribute" ? { authorized: true, actorId: "u1" } : FORBIDDEN,
    );
    findSectorIdsForUser.mockResolvedValue(["s1", "s2"]);

    const { resolveManageableSectors } = await import("./index");
    expect(await resolveManageableSectors()).toEqual({ scope: "scoped", sectorIds: ["s1", "s2"] });
  });

  it("returns { scope: none } when the actor has no plugin permission", async () => {
    authorizeActor.mockResolvedValue(FORBIDDEN);

    const { resolveManageableSectors } = await import("./index");
    expect(await resolveManageableSectors()).toEqual({ scope: "none" });
  });
});
