import { beforeEach, describe, expect, it, vi } from "vitest";
import { invalidateCache } from "@/infrastructure/cache/memory-cache";

const findExtensionStatesByKind = vi.fn();

vi.mock("./store", () => ({
  findExtensionStatesByKind: (...args: unknown[]) => findExtensionStatesByKind(...args),
}));

describe("listExtensionStates", () => {
  beforeEach(() => {
    findExtensionStatesByKind.mockReset();
    invalidateCache("extensions:list:plugin");
  });

  it("maps the rows to a key -> { installed, enabled } record", async () => {
    const installedAt = new Date("2026-01-01T00:00:00Z");
    findExtensionStatesByKind.mockResolvedValue([
      { key: "birthdays", enabled: false, installedAt },
      { key: "academy", enabled: true, installedAt },
      { key: "broadcast", enabled: true, installedAt: null },
    ]);

    const { listExtensionStates } = await import("./service");
    const result = await listExtensionStates({ kind: "plugin" });

    expect(result).toEqual({
      success: true,
      data: {
        birthdays: { installed: true, enabled: false },
        academy: { installed: true, enabled: true },
        broadcast: { installed: false, enabled: true },
      },
    });
  });

  it("does not hit the store again on a cache hit", async () => {
    findExtensionStatesByKind.mockResolvedValue([]);

    const { listExtensionStates } = await import("./service");
    await listExtensionStates({ kind: "plugin" });
    await listExtensionStates({ kind: "plugin" });

    expect(findExtensionStatesByKind).toHaveBeenCalledTimes(1);
  });
});
