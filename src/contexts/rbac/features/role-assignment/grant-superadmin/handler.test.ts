import { beforeEach, describe, expect, it, vi } from "vitest";

const grantSuperadmin = vi.fn();

vi.mock("./service", () => ({
  grantSuperadmin: (...args: unknown[]) => grantSuperadmin(...args),
}));

const checkSuperadminExists = vi.fn();

vi.mock("../check-superadmin-exists/service", () => ({
  checkSuperadminExists: (...args: unknown[]) => checkSuperadminExists(...args),
}));

describe("grantSuperadminHandler", () => {
  beforeEach(() => {
    grantSuperadmin.mockReset();
    checkSuperadminExists.mockReset();
    checkSuperadminExists.mockResolvedValue({ success: true, data: false });
  });

  it("rejects an empty userId without calling the service", async () => {
    const { grantSuperadminHandler } = await import("./handler");
    const result = await grantSuperadminHandler({ userId: "" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.invalid_id", message: expect.any(String) },
    });
    expect(grantSuperadmin).not.toHaveBeenCalled();
  });

  it("delegates to the service when no superadmin exists yet", async () => {
    grantSuperadmin.mockResolvedValue({ success: true, data: undefined });

    const { grantSuperadminHandler } = await import("./handler");
    const result = await grantSuperadminHandler({ userId: "user-1" });

    expect(checkSuperadminExists).toHaveBeenCalledTimes(1);
    expect(grantSuperadmin).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("refuses to grant when a superadmin already exists (P1)", async () => {
    checkSuperadminExists.mockResolvedValue({ success: true, data: true });

    const { grantSuperadminHandler } = await import("./handler");
    const result = await grantSuperadminHandler({ userId: "user-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.roles.superadmin_already_exists", message: expect.any(String) },
    });
    expect(grantSuperadmin).not.toHaveBeenCalled();
  });

  it("propagates a failure from the exists check", async () => {
    const error = { code: "infra.unexpected", message: "boom" };
    checkSuperadminExists.mockResolvedValue({ success: false, error });

    const { grantSuperadminHandler } = await import("./handler");
    const result = await grantSuperadminHandler({ userId: "user-1" });

    expect(result).toEqual({ success: false, error });
    expect(grantSuperadmin).not.toHaveBeenCalled();
  });

  it("skips the exists check when bypassExistsCheck is set (bootstrap script)", async () => {
    checkSuperadminExists.mockResolvedValue({ success: true, data: true });
    grantSuperadmin.mockResolvedValue({ success: true, data: undefined });

    const { grantSuperadminHandler } = await import("./handler");
    const result = await grantSuperadminHandler({ userId: "user-1", bypassExistsCheck: true });

    expect(checkSuperadminExists).not.toHaveBeenCalled();
    expect(grantSuperadmin).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result).toEqual({ success: true, data: undefined });
  });
});
