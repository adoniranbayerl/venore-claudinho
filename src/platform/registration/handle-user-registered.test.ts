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

describe("handleUserRegistered", () => {
  const originalEnv = process.env.AUTH_REGISTRATION_APPROVAL_REQUIRED;
  const user = { id: "user-1", email: "a@b.com", name: "A" };

  beforeEach(() => {
    provisionUser.mockReset();
    grantDefaultRoleOnRegistration.mockReset();
    superadminExists.mockReset();
    grantSuperadmin.mockReset();
    superadminExists.mockResolvedValue({ success: true, data: true });
  });

  afterEach(() => {
    process.env.AUTH_REGISTRATION_APPROVAL_REQUIRED = originalEnv;
  });

  it("marks the user as pending (via auth) when approval is required (default) and a superadmin already exists", async () => {
    delete process.env.AUTH_REGISTRATION_APPROVAL_REQUIRED;
    provisionUser.mockResolvedValue({ success: true, data: undefined });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(provisionUser).toHaveBeenCalledWith(user);
    expect(grantDefaultRoleOnRegistration).not.toHaveBeenCalled();
    expect(grantSuperadmin).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("grants the default role (via rbac) when approval is disabled and a superadmin already exists, without touching auth", async () => {
    process.env.AUTH_REGISTRATION_APPROVAL_REQUIRED = "false";
    grantDefaultRoleOnRegistration.mockResolvedValue({ success: true, data: undefined });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(provisionUser).not.toHaveBeenCalled();
    expect(grantDefaultRoleOnRegistration).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("propagates the error when granting the default role fails", async () => {
    process.env.AUTH_REGISTRATION_APPROVAL_REQUIRED = "false";
    const error = { code: "rbac.roles.not_found", message: "não encontrado" };
    grantDefaultRoleOnRegistration.mockResolvedValue({ success: false, error });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(result).toEqual({ success: false, error });
  });

  it("grants superadmin directly, skipping pending, when no superadmin exists yet (approval required)", async () => {
    delete process.env.AUTH_REGISTRATION_APPROVAL_REQUIRED;
    superadminExists.mockResolvedValue({ success: true, data: false });
    grantSuperadmin.mockResolvedValue({ success: true, data: undefined });

    const { handleUserRegistered } = await import("./handle-user-registered");
    const result = await handleUserRegistered(user);

    expect(grantSuperadmin).toHaveBeenCalledWith({ userId: "user-1" });
    expect(provisionUser).not.toHaveBeenCalled();
    expect(grantDefaultRoleOnRegistration).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("grants superadmin directly, skipping the default role, when no superadmin exists yet (approval disabled)", async () => {
    process.env.AUTH_REGISTRATION_APPROVAL_REQUIRED = "false";
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
