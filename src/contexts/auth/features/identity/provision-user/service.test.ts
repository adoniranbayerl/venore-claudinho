import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "user-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const updateUserStatus = vi.fn();

vi.mock("./store", () => ({
  updateUserStatus: (...args: unknown[]) => updateUserStatus(...args),
}));

describe("provisionUser", () => {
  beforeEach(() => {
    updateUserStatus.mockReset();
  });

  it("always marks the user as pending", async () => {
    const { provisionUser } = await import("./service");
    const result = await provisionUser({ id: "user-1", email: "a@b.com", name: "A" });

    expect(updateUserStatus).toHaveBeenCalledWith("user-1", "pending");
    expect(result).toEqual({ success: true, data: undefined });
  });
});
