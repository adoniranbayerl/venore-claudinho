import { beforeEach, describe, expect, it, vi } from "vitest";

const listPendingUsers = vi.fn();

vi.mock("@/contexts/auth", () => ({
  listPendingUsers: (...args: unknown[]) => listPendingUsers(...args),
}));

describe("listPendingRegistrations", () => {
  beforeEach(() => {
    listPendingUsers.mockReset();
  });

  it("propagates the error when the auth query fails", async () => {
    const error = { code: "auth.unexpected", message: "falhou" };
    listPendingUsers.mockResolvedValue({ success: false, error });

    const { listPendingRegistrations } = await import("./service");
    const result = await listPendingRegistrations();

    expect(result).toEqual({ success: false, error });
  });

  it("maps pending users into the registration view", async () => {
    const createdAt = new Date("2026-01-01");
    listPendingUsers.mockResolvedValue({
      success: true,
      data: [{ id: "user-1", email: "a@b.com", name: "A", createdAt }],
    });

    const { listPendingRegistrations } = await import("./service");
    const result = await listPendingRegistrations();

    expect(result).toEqual({
      success: true,
      data: [{ userId: "user-1", email: "a@b.com", name: "A", pendingSince: createdAt }],
    });
  });
});
