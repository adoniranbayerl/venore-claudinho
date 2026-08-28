import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const getUserContext = vi.fn();

vi.mock("@/contexts/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

vi.mock("./features/role-assignment/get-user-context/service", () => ({
  getUserContext: (...args: unknown[]) => getUserContext(...args),
}));

describe("authorizeActor", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    getUserContext.mockReset();
  });

  it("rejects when there is no authenticated user", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("rbac.roles.assign");

    expect(result).toEqual({
      authorized: false,
      error: { code: "rbac.authorization.unauthenticated", message: expect.any(String) },
    });
    expect(getUserContext).not.toHaveBeenCalled();
  });

  it("rejects when the actor lacks the required permission", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: ["cms.entries.manage"], isSuperadmin: false },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("rbac.roles.assign");

    expect(result).toEqual({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: expect.any(String) },
    });
  });

  it("authorizes when the actor has the required permission", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: ["rbac.roles.assign"], isSuperadmin: false },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("rbac.roles.assign");

    expect(result).toEqual({ authorized: true, actorId: "user-1" });
  });

  it("bypasses the permission check for a superadmin", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: [], isSuperadmin: true },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("rbac.roles.assign");

    expect(result).toEqual({ authorized: true, actorId: "user-1" });
  });

  it("authorizes when the actor has any one of a list of required permissions (OR, not AND)", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: ["cms.entries.manage"], isSuperadmin: false },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor(["cms.entries.publish", "cms.entries.manage"]);

    expect(result).toEqual({ authorized: true, actorId: "user-1" });
  });

  it("rejects when the actor has none of a list of required permissions", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: ["cms.categories.manage"], isSuperadmin: false },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor(["cms.entries.publish", "cms.entries.manage"]);

    expect(result).toEqual({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: expect.any(String) },
    });
  });

  it("propagates a failure from getUserContext", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
    getUserContext.mockResolvedValue({
      success: false,
      error: { code: "rbac.roles.invalid_id", message: "userId não pode ser vazio." },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("rbac.roles.assign");

    expect(result).toEqual({
      authorized: false,
      error: { code: "rbac.roles.invalid_id", message: expect.any(String) },
    });
  });
});

describe("authorizeActor — with a resource scope (Fase B)", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    getUserContext.mockReset();
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
  });

  it("authorizes when the actor holds the permission globally for that scope type", async () => {
    getUserContext.mockResolvedValue({
      success: true,
      data: {
        userId: "user-1",
        roles: [],
        permissions: ["cms.entries.manage"],
        isSuperadmin: false,
        scopedPermissions: { "cms.entries.manage": { "cms.category": "global" } },
      },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("cms.entries.manage", { type: "cms.category", resourceId: "cat-a" });

    expect(result).toEqual({ authorized: true, actorId: "user-1" });
  });

  it("authorizes when the requested resource id is in the scoped list", async () => {
    getUserContext.mockResolvedValue({
      success: true,
      data: {
        userId: "user-1",
        roles: [],
        permissions: ["cms.entries.manage"],
        isSuperadmin: false,
        scopedPermissions: { "cms.entries.manage": { "cms.category": ["cat-a", "cat-b"] } },
      },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("cms.entries.manage", { type: "cms.category", resourceId: "cat-b" });

    expect(result).toEqual({ authorized: true, actorId: "user-1" });
  });

  it("rejects with forbidden_scope when the resource id is outside the scoped list", async () => {
    getUserContext.mockResolvedValue({
      success: true,
      data: {
        userId: "user-1",
        roles: [],
        permissions: ["cms.entries.manage"],
        isSuperadmin: false,
        scopedPermissions: { "cms.entries.manage": { "cms.category": ["cat-a"] } },
      },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("cms.entries.manage", { type: "cms.category", resourceId: "cat-z" });

    expect(result).toEqual({
      authorized: false,
      error: { code: "rbac.authorization.forbidden_scope", message: expect.any(String) },
    });
  });

  it("rejects with plain forbidden when the actor lacks the permission entirely (scope never consulted)", async () => {
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: ["cms.categories.manage"], isSuperadmin: false, scopedPermissions: {} },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("cms.entries.manage", { type: "cms.category", resourceId: "cat-a" });

    expect(result).toEqual({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: expect.any(String) },
    });
  });

  it("lets a superadmin through regardless of the scope", async () => {
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: [], isSuperadmin: true, scopedPermissions: {} },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor("cms.entries.manage", { type: "cms.category", resourceId: "cat-a" });

    expect(result).toEqual({ authorized: true, actorId: "user-1" });
  });

  it("passes when any one key in a list satisfies the scope (OR)", async () => {
    getUserContext.mockResolvedValue({
      success: true,
      data: {
        userId: "user-1",
        roles: [],
        permissions: ["cms.entries.manage"],
        isSuperadmin: false,
        scopedPermissions: { "cms.entries.manage": { "cms.category": ["cat-a"] } },
      },
    });

    const { authorizeActor } = await import("./authorize-actor");
    const result = await authorizeActor(["cms.entries.publish", "cms.entries.manage"], {
      type: "cms.category",
      resourceId: "cat-a",
    });

    expect(result).toEqual({ authorized: true, actorId: "user-1" });
  });
});

describe("resolveScope (Fase B)", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    getUserContext.mockReset();
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "user-1", email: null, name: null, image: null } });
  });

  it("returns { kind: 'global' } for a superadmin", async () => {
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: [], isSuperadmin: true, scopedPermissions: {} },
    });

    const { resolveScope } = await import("./authorize-actor");
    expect(await resolveScope("cms.entries.manage", "cms.category")).toEqual({ kind: "global" });
  });

  it("returns { kind: 'global' } when a role grants the permission without a scope of that type", async () => {
    getUserContext.mockResolvedValue({
      success: true,
      data: {
        userId: "user-1",
        roles: [],
        permissions: ["cms.entries.manage"],
        isSuperadmin: false,
        scopedPermissions: { "cms.entries.manage": { "cms.category": "global" } },
      },
    });

    const { resolveScope } = await import("./authorize-actor");
    expect(await resolveScope("cms.entries.manage", "cms.category")).toEqual({ kind: "global" });
  });

  it("returns { kind: 'scoped', resourceIds } when the permission is narrowed", async () => {
    getUserContext.mockResolvedValue({
      success: true,
      data: {
        userId: "user-1",
        roles: [],
        permissions: ["cms.entries.manage"],
        isSuperadmin: false,
        scopedPermissions: { "cms.entries.manage": { "cms.category": ["cat-a", "cat-b"] } },
      },
    });

    const { resolveScope } = await import("./authorize-actor");
    expect(await resolveScope("cms.entries.manage", "cms.category")).toEqual({
      kind: "scoped",
      resourceIds: ["cat-a", "cat-b"],
    });
  });

  it("returns { kind: 'none' } when the actor does not hold the permission at all", async () => {
    getUserContext.mockResolvedValue({
      success: true,
      data: { userId: "user-1", roles: [], permissions: [], isSuperadmin: false, scopedPermissions: {} },
    });

    const { resolveScope } = await import("./authorize-actor");
    expect(await resolveScope("cms.entries.manage", "cms.category")).toEqual({ kind: "none" });
  });

  it("returns { kind: 'none' } when there is no authenticated actor", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });

    const { resolveScope } = await import("./authorize-actor");
    expect(await resolveScope("cms.entries.manage", "cms.category")).toEqual({ kind: "none" });
  });
});
