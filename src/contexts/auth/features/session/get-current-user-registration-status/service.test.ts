import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const findUserStatusById = vi.fn();

vi.mock("../get-current-user/store", () => ({
  getSession: (...args: unknown[]) => getSession(...args),
}));

vi.mock("./store", () => ({
  findUserStatusById: (...args: unknown[]) => findUserStatusById(...args),
}));

describe("getCurrentUserRegistrationStatusService", () => {
  beforeEach(() => {
    getSession.mockReset();
    findUserStatusById.mockReset();
  });

  it("returns null when there is no active session", async () => {
    getSession.mockResolvedValue(null);

    const { getCurrentUserRegistrationStatusService } = await import("./service");
    const result = await getCurrentUserRegistrationStatusService();

    expect(result).toEqual({ success: true, data: null });
    expect(findUserStatusById).not.toHaveBeenCalled();
  });

  it("returns the status of the session user", async () => {
    getSession.mockResolvedValue({ user: { id: "user-1" } });
    findUserStatusById.mockResolvedValue("pending");

    const { getCurrentUserRegistrationStatusService } = await import("./service");
    const result = await getCurrentUserRegistrationStatusService();

    expect(findUserStatusById).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ success: true, data: "pending" });
  });
});
