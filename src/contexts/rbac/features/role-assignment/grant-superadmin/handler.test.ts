import { beforeEach, describe, expect, it, vi } from "vitest";

const grantSuperadmin = vi.fn();

vi.mock("./service", () => ({
  grantSuperadmin: (...args: unknown[]) => grantSuperadmin(...args),
}));

describe("grantSuperadminHandler", () => {
  beforeEach(() => {
    grantSuperadmin.mockReset();
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

  it("delegates to the service without any authorization check", async () => {
    grantSuperadmin.mockResolvedValue({ success: true, data: undefined });

    const { grantSuperadminHandler } = await import("./handler");
    const result = await grantSuperadminHandler({ userId: "user-1" });

    expect(grantSuperadmin).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result).toEqual({ success: true, data: undefined });
  });
});
