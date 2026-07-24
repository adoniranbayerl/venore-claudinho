import { beforeEach, describe, expect, it, vi } from "vitest";

const grantDefaultRoleOnRegistration = vi.fn();

vi.mock("./service", () => ({
  grantDefaultRoleOnRegistration: (...args: unknown[]) => grantDefaultRoleOnRegistration(...args),
}));

describe("grantDefaultRoleOnRegistrationHandler", () => {
  beforeEach(() => {
    grantDefaultRoleOnRegistration.mockReset();
  });

  it("rejects an empty userId without calling the service", async () => {
    const { grantDefaultRoleOnRegistrationHandler } = await import("./handler");
    const result = await grantDefaultRoleOnRegistrationHandler({ userId: "" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_id", message: expect.any(String) },
    });
    expect(grantDefaultRoleOnRegistration).not.toHaveBeenCalled();
  });

  it("delegates to the service without any authorization check", async () => {
    grantDefaultRoleOnRegistration.mockResolvedValue({ success: true, data: undefined });

    const { grantDefaultRoleOnRegistrationHandler } = await import("./handler");
    const result = await grantDefaultRoleOnRegistrationHandler({ userId: "user-1" });

    expect(grantDefaultRoleOnRegistration).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result).toEqual({ success: true, data: undefined });
  });
});
