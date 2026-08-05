import { beforeEach, describe, expect, it, vi } from "vitest";

const selectWhere = vi.fn();
const selectFrom = vi.fn(() => ({ where: selectWhere }));
const selectMock = vi.fn(() => ({ from: selectFrom }));
const updateWhere = vi.fn().mockResolvedValue(undefined);
const updateSet = vi.fn(() => ({ where: updateWhere }));
const updateMock = vi.fn(() => ({ set: updateSet }));

vi.mock("@/infrastructure/database/client", () => ({
  db: { select: selectMock, update: updateMock },
}));

const invalidateCacheByPrefix = vi.fn();

vi.mock("@/infrastructure/cache/memory-cache", () => ({
  invalidateCacheByPrefix: (...args: unknown[]) => invalidateCacheByPrefix(...args),
}));

describe("processScheduledEntries", () => {
  beforeEach(() => {
    selectMock.mockClear();
    selectFrom.mockClear();
    selectWhere.mockReset();
    updateMock.mockClear();
    updateSet.mockClear();
    updateWhere.mockClear();
    invalidateCacheByPrefix.mockClear();
  });

  it("does nothing and invalidates no cache when nothing is due", async () => {
    selectWhere.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const { processScheduledEntries } = await import("./scheduling");
    const result = await processScheduledEntries(new Date("2026-01-01T00:00:00.000Z"));

    expect(result).toEqual({ published: 0, archived: 0 });
    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateCacheByPrefix).not.toHaveBeenCalled();
  });

  it("publishes scheduled entries whose scheduledPublishAt is due, and invalidates published/navigation caches", async () => {
    selectWhere.mockResolvedValueOnce([{ id: "entry-1" }, { id: "entry-2" }]).mockResolvedValueOnce([]);

    const { processScheduledEntries } = await import("./scheduling");
    const result = await processScheduledEntries(new Date("2026-01-01T00:00:00.000Z"));

    expect(result).toEqual({ published: 2, archived: 0 });
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "published", scheduledPublishAt: null }),
    );
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("cms:entries:published");
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("cms:navigation");
  });

  it("archives scheduled or published entries whose scheduledArchiveAt is due", async () => {
    selectWhere.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "entry-3" }]);

    const { processScheduledEntries } = await import("./scheduling");
    const result = await processScheduledEntries(new Date("2026-01-01T00:00:00.000Z"));

    expect(result).toEqual({ published: 0, archived: 1 });
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({ status: "archived" }));
  });

  it("handles both a due publish and a due archive in the same sweep", async () => {
    selectWhere.mockResolvedValueOnce([{ id: "entry-1" }]).mockResolvedValueOnce([{ id: "entry-4" }]);

    const { processScheduledEntries } = await import("./scheduling");
    const result = await processScheduledEntries(new Date("2026-01-01T00:00:00.000Z"));

    expect(result).toEqual({ published: 1, archived: 1 });
    expect(updateMock).toHaveBeenCalledTimes(2);
  });
});
