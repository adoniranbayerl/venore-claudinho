import { beforeEach, describe, expect, it, vi } from "vitest";

const findPendingUsers = vi.fn();

vi.mock("./store", () => ({
  findPendingUsers: (...args: unknown[]) => findPendingUsers(...args),
}));

describe("listPendingUsers", () => {
  beforeEach(() => {
    findPendingUsers.mockReset();
  });

  it("returns the pending users from the store", async () => {
    const pendingUsers = [{ id: "user-1", email: "a@b.com", name: "A", createdAt: new Date("2026-01-01") }];
    findPendingUsers.mockResolvedValue(pendingUsers);

    const { listPendingUsers } = await import("./service");
    const result = await listPendingUsers();

    expect(result).toEqual({ success: true, data: pendingUsers });
  });
});
