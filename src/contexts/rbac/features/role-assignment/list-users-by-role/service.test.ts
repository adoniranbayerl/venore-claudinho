import { beforeEach, describe, expect, it, vi } from "vitest";

const findUserIdsWithRole = vi.fn();

vi.mock("./store", () => ({
  findUserIdsWithRole: (...args: unknown[]) => findUserIdsWithRole(...args),
}));

const listUsers = vi.fn();

vi.mock("@/contexts/auth", () => ({
  listUsers: (...args: unknown[]) => listUsers(...args),
}));

describe("listUsersByRole", () => {
  beforeEach(() => {
    findUserIdsWithRole.mockReset();
    listUsers.mockReset();
  });

  it("returns an empty list without querying auth when no user has the role", async () => {
    findUserIdsWithRole.mockResolvedValue([]);

    const { listUsersByRole } = await import("./service");
    const result = await listUsersByRole({ roleId: "role-1" });

    expect(result).toEqual({ success: true, data: [] });
    expect(listUsers).not.toHaveBeenCalled();
  });

  it("filters the full user directory down to the users with the role", async () => {
    findUserIdsWithRole.mockResolvedValue(["user-1"]);
    listUsers.mockResolvedValue({
      success: true,
      data: [
        { id: "user-1", name: "A", email: "a@b.com", status: "approved" },
        { id: "user-2", name: "B", email: "b@b.com", status: "approved" },
      ],
    });

    const { listUsersByRole } = await import("./service");
    const result = await listUsersByRole({ roleId: "role-1" });

    expect(result).toEqual({ success: true, data: [{ id: "user-1", name: "A", email: "a@b.com" }] });
  });

  it("propagates the error when listing users fails", async () => {
    findUserIdsWithRole.mockResolvedValue(["user-1"]);
    const error = { code: "infra.unexpected", message: "boom" };
    listUsers.mockResolvedValue({ success: false, error });

    const { listUsersByRole } = await import("./service");
    const result = await listUsersByRole({ roleId: "role-1" });

    expect(result).toEqual({ success: false, error });
  });
});
