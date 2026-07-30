import { beforeEach, describe, expect, it, vi } from "vitest";

const countDistinctUsersWithPermissions = vi.fn();

vi.mock("./store", () => ({
  countDistinctUsersWithPermissions: (...args: unknown[]) => countDistinctUsersWithPermissions(...args),
}));

describe("countUsersWithPermissions", () => {
  beforeEach(() => {
    countDistinctUsersWithPermissions.mockReset();
  });

  it("returns 0 without querying the store when no permission key is given", async () => {
    const { countUsersWithPermissions } = await import("./service");
    const result = await countUsersWithPermissions({ permissionKeys: [] });

    expect(result).toEqual({ success: true, data: 0 });
    expect(countDistinctUsersWithPermissions).not.toHaveBeenCalled();
  });

  it("delegates to the store for a non-empty list of permission keys", async () => {
    countDistinctUsersWithPermissions.mockResolvedValue(3);

    const { countUsersWithPermissions } = await import("./service");
    const result = await countUsersWithPermissions({ permissionKeys: ["birthdays.read", "birthdays.manage"] });

    expect(countDistinctUsersWithPermissions).toHaveBeenCalledWith(["birthdays.read", "birthdays.manage"]);
    expect(result).toEqual({ success: true, data: 3 });
  });
});
