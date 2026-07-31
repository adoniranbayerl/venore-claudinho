import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteWhere = vi.fn();
const deleteMock = vi.fn(() => ({ where: deleteWhere }));
const selectFrom = vi.fn();
const selectMock = vi.fn(() => ({ from: selectFrom }));

vi.mock("@/infrastructure/database/client", () => ({
  db: { delete: deleteMock, select: selectMock },
}));

describe("pruneEventsByRetention", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    deleteMock.mockClear();
    deleteWhere.mockReset();
  });

  it("deletes events older than the configured retention window and returns the row count", async () => {
    vi.stubEnv("OBSERVABILITY_RETENTION_DAYS", "30");
    deleteWhere.mockResolvedValue({ rowCount: 12 });
    const { pruneEventsByRetention } = await import("./retention");

    const now = new Date("2026-07-30T00:00:00.000Z");
    const removed = await pruneEventsByRetention(now);

    expect(removed).toBe(12);
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });

  it("returns 0 when nothing is old enough to prune", async () => {
    deleteWhere.mockResolvedValue({ rowCount: 0 });
    const { pruneEventsByRetention } = await import("./retention");

    expect(await pruneEventsByRetention(new Date())).toBe(0);
  });
});

describe("pruneEventsByVolume", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    deleteMock.mockClear();
    deleteWhere.mockReset();
    selectMock.mockClear();
    selectFrom.mockReset();
  });

  it("does nothing when total volume is within the limit", async () => {
    vi.stubEnv("OBSERVABILITY_MAX_EVENT_VOLUME", "1000");
    selectFrom.mockResolvedValueOnce([{ value: 500 }]);
    const { pruneEventsByVolume } = await import("./retention");

    const removed = await pruneEventsByVolume();

    expect(removed).toBe(0);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deletes only the oldest excess rows when volume exceeds the cap — a single-day spike cannot fill the table", async () => {
    vi.stubEnv("OBSERVABILITY_MAX_EVENT_VOLUME", "1000");
    // Primeira chamada select = contagem total; segunda = ids mais antigos além do limite.
    selectFrom
      .mockResolvedValueOnce([{ value: 1200 }])
      .mockReturnValueOnce({
        orderBy: () => ({
          limit: () => Promise.resolve([{ id: "a" }, { id: "b" }]),
        }),
      });
    deleteWhere.mockResolvedValue({ rowCount: 2 });
    const { pruneEventsByVolume } = await import("./retention");

    const removed = await pruneEventsByVolume();

    expect(removed).toBe(2);
    expect(deleteMock).toHaveBeenCalledTimes(1);
  });
});
