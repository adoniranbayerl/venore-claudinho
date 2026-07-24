import { beforeEach, describe, expect, it, vi } from "vitest";

const approveUserRegistration = vi.fn();

vi.mock("./service", () => ({
  approveUserRegistration: (...args: unknown[]) => approveUserRegistration(...args),
}));

describe("approveUserRegistrationHandler", () => {
  beforeEach(() => {
    approveUserRegistration.mockReset();
  });

  it("rejects an empty userId without calling the service", async () => {
    const { approveUserRegistrationHandler } = await import("./handler");
    const result = await approveUserRegistrationHandler({ userId: "" });

    expect(result).toEqual({
      success: false,
      error: { code: "auth.registrations.invalid_id", message: expect.any(String) },
    });
    expect(approveUserRegistration).not.toHaveBeenCalled();
  });

  it("delegates to the service", async () => {
    approveUserRegistration.mockResolvedValue({ success: true, data: undefined });

    const { approveUserRegistrationHandler } = await import("./handler");
    const result = await approveUserRegistrationHandler({ userId: "user-1" });

    expect(approveUserRegistration).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result).toEqual({ success: true, data: undefined });
  });
});
