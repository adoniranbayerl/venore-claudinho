import { beforeEach, describe, expect, it, vi } from "vitest";

const findUserByEmailQuery = vi.fn();

vi.mock("./service", () => ({
  findUserByEmailQuery: (...args: unknown[]) => findUserByEmailQuery(...args),
}));

describe("findUserByEmailHandler", () => {
  beforeEach(() => {
    findUserByEmailQuery.mockReset();
  });

  it("rejects an empty email without calling the service", async () => {
    const { findUserByEmailHandler } = await import("./handler");
    const result = await findUserByEmailHandler({ email: "" });

    expect(result).toEqual({
      success: false,
      error: { code: "auth.users.invalid_email", message: expect.any(String) },
    });
    expect(findUserByEmailQuery).not.toHaveBeenCalled();
  });

  it("delegates to the service", async () => {
    findUserByEmailQuery.mockResolvedValue({ success: true, data: { id: "user-1", email: "a@b.com", name: "A", image: null } });

    const { findUserByEmailHandler } = await import("./handler");
    const result = await findUserByEmailHandler({ email: "a@b.com" });

    expect(findUserByEmailQuery).toHaveBeenCalledWith({ email: "a@b.com" });
    expect(result).toEqual({ success: true, data: { id: "user-1", email: "a@b.com", name: "A", image: null } });
  });
});
