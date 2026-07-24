import { beforeEach, describe, expect, it, vi } from "vitest";

const checkSuperadminExists = vi.fn();

vi.mock("./service", () => ({
  checkSuperadminExists: (...args: unknown[]) => checkSuperadminExists(...args),
}));

describe("checkSuperadminExistsHandler", () => {
  beforeEach(() => {
    checkSuperadminExists.mockReset();
  });

  it("delegates to the service without any authorization check", async () => {
    checkSuperadminExists.mockResolvedValue({ success: true, data: true });

    const { checkSuperadminExistsHandler } = await import("./handler");
    const result = await checkSuperadminExistsHandler();

    expect(checkSuperadminExists).toHaveBeenCalledWith();
    expect(result).toEqual({ success: true, data: true });
  });
});
