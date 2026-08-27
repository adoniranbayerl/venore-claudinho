import { beforeEach, describe, expect, it, vi } from "vitest";

const findUserByEmail = vi.fn();

vi.mock("./store", () => ({
  findUserByEmail: (...args: unknown[]) => findUserByEmail(...args),
}));

describe("findUserByEmailQuery", () => {
  beforeEach(() => {
    findUserByEmail.mockReset();
  });

  it("returns the user when found", async () => {
    findUserByEmail.mockResolvedValue({
      id: "user-1",
      email: "a@b.com",
      name: "A",
      image: null,
      avatarMediaId: null,
      passwordHash: null,
      status: "approved",
    });

    const { findUserByEmailQuery } = await import("./service");
    const result = await findUserByEmailQuery({ email: "a@b.com" });

    expect(result).toEqual({
      success: true,
      data: {
        id: "user-1",
        email: "a@b.com",
        name: "A",
        image: null,
        avatarMediaId: null,
        passwordHash: null,
        status: "approved",
      },
    });
  });

  it("fails with a business error when no user matches the email", async () => {
    findUserByEmail.mockResolvedValue(null);

    const { findUserByEmailQuery } = await import("./service");
    const result = await findUserByEmailQuery({ email: "missing@b.com" });

    expect(result).toEqual({
      success: false,
      error: { code: "auth.users.not_found", message: expect.any(String) },
    });
  });
});
