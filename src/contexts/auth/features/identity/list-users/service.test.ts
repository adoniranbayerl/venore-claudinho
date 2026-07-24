import { beforeEach, describe, expect, it, vi } from "vitest";

const findAllUsers = vi.fn();

vi.mock("./store", () => ({
  findAllUsers: (...args: unknown[]) => findAllUsers(...args),
}));

describe("listUsers", () => {
  beforeEach(() => {
    findAllUsers.mockReset();
  });

  it("returns all users", async () => {
    findAllUsers.mockResolvedValue([{ id: "user-1", name: "A", email: "a@b.com", status: "approved" }]);

    const { listUsers } = await import("./service");
    const result = await listUsers();

    expect(result).toEqual({
      success: true,
      data: [{ id: "user-1", name: "A", email: "a@b.com", status: "approved" }],
    });
  });
});
