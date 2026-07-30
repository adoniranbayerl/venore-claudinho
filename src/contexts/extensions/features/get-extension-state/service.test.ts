import { beforeEach, describe, expect, it, vi } from "vitest";

const findExtensionState = vi.fn();

vi.mock("./store", () => ({
  findExtensionState: (...args: unknown[]) => findExtensionState(...args),
}));

describe("getExtensionState", () => {
  beforeEach(() => {
    findExtensionState.mockReset();
  });

  it("defaults to enabled when there is no row for the key", async () => {
    findExtensionState.mockResolvedValue(null);

    const { getExtensionState } = await import("./service");
    const result = await getExtensionState({ kind: "theme", key: "venore-basic" });

    expect(result).toEqual({ success: true, data: { enabled: true } });
  });

  it("returns the persisted state when a row exists", async () => {
    findExtensionState.mockResolvedValue({ enabled: false });

    const { getExtensionState } = await import("./service");
    const result = await getExtensionState({ kind: "plugin", key: "birthdays" });

    expect(result).toEqual({ success: true, data: { enabled: false } });
  });
});
