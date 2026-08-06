import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const provisionUser = vi.fn();

vi.mock("@/contexts/auth", () => ({
  provisionUser: (...args: unknown[]) => provisionUser(...args),
}));

const grantDefaultRoleOnRegistration = vi.fn();
const superadminExists = vi.fn();
const grantSuperadmin = vi.fn();

vi.mock("@/contexts/rbac", () => ({
  grantDefaultRoleOnRegistration: (...args: unknown[]) => grantDefaultRoleOnRegistration(...args),
  superadminExists: (...args: unknown[]) => superadminExists(...args),
  grantSuperadmin: (...args: unknown[]) => grantSuperadmin(...args),
}));

const getSetting = vi.fn();

vi.mock("@/contexts/settings", () => ({
  getSetting: (...args: unknown[]) => getSetting(...args),
}));

const registerPlugins = vi.fn();

vi.mock("@/platform/plugin-engine/register-plugins", () => ({
  registerPlugins: (...args: unknown[]) => registerPlugins(...args),
}));

describe("handleUserRegistered", () => {
  const user = { id: "user-1", email: "a@b.com", name: "A" };

  beforeEach(() => {
    provisionUser.mockReset();
    grantDefaultRoleOnRegistration.mockReset();
    superadminExists.mockReset();
    grantSuperadmin.mockReset();
    getSetting.mockReset();
    registerPlugins.mockReset();
    registerPlugins.mockResolvedValue(undefined);
    superadminExists.mockResolvedValue({ success: true, data: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("marks the user as pending (via auth) when approval is required (default, setting absent) and a superadmin already exists", async () => {
    getSetting.mockResolvedValue({ success: true, data: null });
    provisionUser.mockResolvedValue({ success: true, data: undefined });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(getSetting).toHaveBeenCalledWith({ key: "auth.registration_approval_required" });
    expect(provisionUser).toHaveBeenCalledWith(user);
    expect(grantDefaultRoleOnRegistration).not.toHaveBeenCalled();
    expect(grantSuperadmin).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("marks the user as pending (via auth) when the setting is explicitly \"true\"", async () => {
    getSetting.mockResolvedValue({ success: true, data: { key: "auth.registration_approval_required", value: "true", updatedAt: new Date() } });
    provisionUser.mockResolvedValue({ success: true, data: undefined });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(provisionUser).toHaveBeenCalledWith(user);
    expect(grantDefaultRoleOnRegistration).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("grants the default role (via rbac) when the setting is \"false\" and a superadmin already exists, without touching auth", async () => {
    getSetting.mockResolvedValue({ success: true, data: { key: "auth.registration_approval_required", value: "false", updatedAt: new Date() } });
    grantDefaultRoleOnRegistration.mockResolvedValue({ success: true, data: undefined });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(provisionUser).not.toHaveBeenCalled();
    expect(grantDefaultRoleOnRegistration).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("falls back to approval required when reading the setting fails", async () => {
    getSetting.mockResolvedValue({ success: false, error: { code: "infra.unexpected", message: "boom" } });
    provisionUser.mockResolvedValue({ success: true, data: undefined });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(provisionUser).toHaveBeenCalledWith(user);
    expect(grantDefaultRoleOnRegistration).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("propagates the error when granting the default role fails", async () => {
    getSetting.mockResolvedValue({ success: true, data: { key: "auth.registration_approval_required", value: "false", updatedAt: new Date() } });
    const error = { code: "rbac.roles.not_found", message: "não encontrado" };
    grantDefaultRoleOnRegistration.mockResolvedValue({ success: false, error });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(result).toEqual({ success: false, error });
  });

  it("grants superadmin directly, skipping pending, when no superadmin exists yet (approval required)", async () => {
    getSetting.mockResolvedValue({ success: true, data: null });
    superadminExists.mockResolvedValue({ success: true, data: false });
    grantSuperadmin.mockResolvedValue({ success: true, data: undefined });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(grantSuperadmin).toHaveBeenCalledWith({ userId: "user-1" });
    expect(provisionUser).not.toHaveBeenCalled();
    expect(grantDefaultRoleOnRegistration).not.toHaveBeenCalled();
    expect(getSetting).not.toHaveBeenCalled();
    expect(registerPlugins).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("grants superadmin directly, skipping the default role, when no superadmin exists yet (approval disabled)", async () => {
    getSetting.mockResolvedValue({ success: true, data: { key: "auth.registration_approval_required", value: "false", updatedAt: new Date() } });
    superadminExists.mockResolvedValue({ success: true, data: false });
    grantSuperadmin.mockResolvedValue({ success: true, data: undefined });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(grantSuperadmin).toHaveBeenCalledWith({ userId: "user-1" });
    expect(provisionUser).not.toHaveBeenCalled();
    expect(grantDefaultRoleOnRegistration).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("propagates the error when checking for an existing superadmin fails", async () => {
    const error = { code: "infra.unexpected", message: "boom" };
    superadminExists.mockResolvedValue({ success: false, error });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(result).toEqual({ success: false, error });
    expect(provisionUser).not.toHaveBeenCalled();
    expect(grantDefaultRoleOnRegistration).not.toHaveBeenCalled();
    expect(grantSuperadmin).not.toHaveBeenCalled();
  });
});
