import { beforeEach, describe, expect, it, vi } from "vitest";

const updateWhere = vi.fn().mockResolvedValue(undefined);
const updateSet = vi.fn(() => ({ where: updateWhere }));
const updateMock = vi.fn(() => ({ set: updateSet }));

vi.mock("@/infrastructure/database/client", () => ({
  db: { update: updateMock },
}));

describe("view-tracking", () => {
  beforeEach(() => {
    updateMock.mockClear();
    updateSet.mockClear();
    updateWhere.mockClear();
  });

  it("does nothing when there are no pending views", async () => {
    const { flushEntryViews } = await import("./view-tracking");

    const flushed = await flushEntryViews();

    expect(flushed).toBe(0);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("batches repeated views to the same entry between flushes into a single update", async () => {
    const { recordEntryView, flushEntryViews } = await import("./view-tracking");

    recordEntryView("entry-1");
    recordEntryView("entry-1");
    recordEntryView("entry-1");

    const flushed = await flushEntryViews();

    expect(flushed).toBe(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
  });

  it("issues one update per distinct entry viewed", async () => {
    const { recordEntryView, flushEntryViews } = await import("./view-tracking");

    recordEntryView("entry-1");
    recordEntryView("entry-2");

    const flushed = await flushEntryViews();

    expect(flushed).toBe(2);
    expect(updateMock).toHaveBeenCalledTimes(2);
  });

  it("clears the buffer after a flush, so a second flush with no new views does nothing", async () => {
    const { recordEntryView, flushEntryViews } = await import("./view-tracking");

    recordEntryView("entry-1");
    await flushEntryViews();
    updateMock.mockClear();

    const secondFlush = await flushEntryViews();

    expect(secondFlush).toBe(0);
    expect(updateMock).not.toHaveBeenCalled();
  });
});
