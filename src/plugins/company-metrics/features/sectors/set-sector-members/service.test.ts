import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const findSectorById = vi.fn();
const findAdminUserIds = vi.fn();
const replaceSectorMembers = vi.fn();
vi.mock("./store", () => ({
  findSectorById: (...args: unknown[]) => findSectorById(...args),
  findAdminUserIds: (...args: unknown[]) => findAdminUserIds(...args),
  replaceSectorMembers: (...args: unknown[]) => replaceSectorMembers(...args),
}));

describe("setSectorMembers", () => {
  beforeEach(() => {
    findSectorById.mockReset();
    findAdminUserIds.mockReset();
    replaceSectorMembers.mockReset();
    findSectorById.mockResolvedValue({ id: "s1", name: "Comercial" });
    findAdminUserIds.mockResolvedValue(["boss"]);
  });

  it("fails when the sector does not exist", async () => {
    findSectorById.mockResolvedValue(null);

    const { setSectorMembers } = await import("./service");
    const result = await setSectorMembers({ sectorId: "missing", members: [], canManageAdmins: true, actorId: "a1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.set-sector-members.not_found");
  });

  it("rejects a duplicated user", async () => {
    const { setSectorMembers } = await import("./service");
    const result = await setSectorMembers({
      sectorId: "s1",
      members: [
        { userId: "u1", role: "editor" },
        { userId: "u1", role: "viewer" },
      ],
      canManageAdmins: true,
      actorId: "a1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.set-sector-members.duplicate_user");
    expect(replaceSectorMembers).not.toHaveBeenCalled();
  });

  it("lets a full manager replace the whole set including admins", async () => {
    const { setSectorMembers } = await import("./service");
    const result = await setSectorMembers({
      sectorId: "s1",
      members: [
        { userId: "boss2", role: "admin" },
        { userId: "u1", role: "editor" },
      ],
      canManageAdmins: true,
      actorId: "a1",
    });

    expect(result.success).toBe(true);
    expect(replaceSectorMembers).toHaveBeenCalledWith("s1", [
      { userId: "boss2", role: "admin" },
      { userId: "u1", role: "editor" },
    ]);
  });

  it("blocks a sector admin (no manage) from changing the admin set", async () => {
    findAdminUserIds.mockResolvedValue(["boss"]);

    const { setSectorMembers } = await import("./service");
    const result = await setSectorMembers({
      sectorId: "s1",
      members: [
        { userId: "boss", role: "admin" },
        { userId: "intruder", role: "admin" },
        { userId: "u1", role: "editor" },
      ],
      canManageAdmins: false,
      actorId: "a1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.set-sector-members.admin_change_forbidden");
    expect(replaceSectorMembers).not.toHaveBeenCalled();
  });

  it("lets a sector admin change editor/viewer while keeping the admin set intact", async () => {
    findAdminUserIds.mockResolvedValue(["boss"]);

    const { setSectorMembers } = await import("./service");
    const result = await setSectorMembers({
      sectorId: "s1",
      members: [
        { userId: "boss", role: "admin" },
        { userId: "u9", role: "viewer" },
      ],
      canManageAdmins: false,
      actorId: "a1",
    });

    expect(result.success).toBe(true);
    expect(replaceSectorMembers).toHaveBeenCalled();
  });
});
