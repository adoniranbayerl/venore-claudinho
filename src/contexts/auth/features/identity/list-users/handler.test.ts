import { beforeEach, describe, expect, it, vi } from "vitest";

const listUsers = vi.fn();

vi.mock("./service", () => ({
  listUsers: (...args: unknown[]) => listUsers(...args),
}));

describe("listUsersHandler", () => {
  beforeEach(() => {
    listUsers.mockReset();
  });

  it("delegates to the service", async () => {
    listUsers.mockResolvedValue({ success: true, data: [] });

    const { listUsersHandler } = await import("./handler");
    const result = await listUsersHandler();

    expect(listUsers).toHaveBeenCalledWith();
    expect(result).toEqual({ success: true, data: [] });
  });
});
