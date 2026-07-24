import { beforeEach, describe, expect, it, vi } from "vitest";

const superadminAssignmentExists = vi.fn();

vi.mock("./store", () => ({
  superadminAssignmentExists: (...args: unknown[]) => superadminAssignmentExists(...args),
}));

describe("checkSuperadminExists", () => {
  beforeEach(() => {
    superadminAssignmentExists.mockReset();
  });

  it("returns true when a superadmin assignment exists", async () => {
    superadminAssignmentExists.mockResolvedValue(true);

    const { checkSuperadminExists } = await import("./service");
    const result = await checkSuperadminExists();

    expect(result).toEqual({ success: true, data: true });
  });

  it("returns false when no superadmin assignment exists", async () => {
    superadminAssignmentExists.mockResolvedValue(false);

    const { checkSuperadminExists } = await import("./service");
    const result = await checkSuperadminExists();

    expect(result).toEqual({ success: true, data: false });
  });
});
