import { beforeEach, describe, expect, it, vi } from "vitest";

const createCustomRole = vi.fn();

vi.mock("./service", () => ({
  createCustomRole: (...args: unknown[]) => createCustomRole(...args),
}));

const authorizeActor = vi.fn();

vi.mock("../../../authorize-actor", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

describe("createCustomRoleHandler", () => {
  beforeEach(() => {
    createCustomRole.mockReset();
    authorizeActor.mockReset();
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
  });

  it("rejects a key that is not kebab-case", async () => {
    const { createCustomRoleHandler } = await import("./handler");
    const result = await createCustomRoleHandler({ key: "Editor_Role", name: "Editor", permissionKeys: [] });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_key", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
    expect(createCustomRole).not.toHaveBeenCalled();
  });

  it("rejects a reserved system role key", async () => {
    const { createCustomRoleHandler } = await import("./handler");
    const result = await createCustomRoleHandler({ key: "superadmin", name: "Fake Superadmin", permissionKeys: [] });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.reserved_key", message: expect.any(String) },
    });
    expect(createCustomRole).not.toHaveBeenCalled();
  });

  it("rejects an empty name", async () => {
    const { createCustomRoleHandler } = await import("./handler");
    const result = await createCustomRoleHandler({ key: "content-lead", name: "   ", permissionKeys: [] });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_name", message: expect.any(String) },
    });
    expect(createCustomRole).not.toHaveBeenCalled();
  });

  it("rejects when the actor is not authorized", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });

    const { createCustomRoleHandler } = await import("./handler");
    const result = await createCustomRoleHandler({ key: "content-lead", name: "Content Lead", permissionKeys: [] });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: "sem permission" },
    });
    expect(authorizeActor).toHaveBeenCalledWith("rbac.roles.manage");
    expect(createCustomRole).not.toHaveBeenCalled();
  });

  it("delegates to the service with the resolved actor when input is valid and authorized", async () => {
    createCustomRole.mockResolvedValue({ success: true, data: { id: "role-1", key: "content-lead", name: "Content Lead", isSystem: false } });

    const { createCustomRoleHandler } = await import("./handler");
    const result = await createCustomRoleHandler({ key: "content-lead", name: "Content Lead", permissionKeys: ["cms.entries.manage"] });

    expect(createCustomRole).toHaveBeenCalledWith({
      key: "content-lead",
      name: "Content Lead",
      permissionKeys: ["cms.entries.manage"],
      actor: { id: "actor-1" },
    });
    expect(result.success).toBe(true);
  });
});
