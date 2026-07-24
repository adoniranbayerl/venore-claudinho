import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "system", type: "system" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const invalidateCache = vi.fn();

vi.mock("../../../../infrastructure/cache/memory-cache", () => ({
  invalidateCache: (...args: unknown[]) => invalidateCache(...args),
}));

const insertSettingIfMissing = vi.fn();

vi.mock("./store", () => ({
  insertSettingIfMissing: (...args: unknown[]) => insertSettingIfMissing(...args),
}));

describe("registerDefaultSetting", () => {
  beforeEach(() => {
    invalidateCache.mockReset();
    insertSettingIfMissing.mockReset();
  });

  it("inserts the default and invalidates the cache when the key is missing", async () => {
    insertSettingIfMissing.mockResolvedValue(true);

    const { registerDefaultSetting } = await import("./service");
    const result = await registerDefaultSetting({ key: "birthdays.reminder_days", value: 7 });

    expect(insertSettingIfMissing).toHaveBeenCalledWith("birthdays.reminder_days", 7);
    expect(invalidateCache).toHaveBeenCalledWith("settings:birthdays.reminder_days");
    expect(result).toEqual({ success: true, data: { key: "birthdays.reminder_days", registered: true } });
  });

  it("does not touch the cache when the key already exists (admin value preserved)", async () => {
    insertSettingIfMissing.mockResolvedValue(false);

    const { registerDefaultSetting } = await import("./service");
    const result = await registerDefaultSetting({ key: "theme.active", value: "default" });

    expect(invalidateCache).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: { key: "theme.active", registered: false } });
  });
});
