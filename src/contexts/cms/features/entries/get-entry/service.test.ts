import { beforeEach, describe, expect, it, vi } from "vitest";

const findPublishedEntryById = vi.fn();

vi.mock("./store", () => ({
  findPublishedEntryById: (...args: unknown[]) => findPublishedEntryById(...args),
}));

describe("getEntry", () => {
  beforeEach(() => {
    findPublishedEntryById.mockReset();
  });

  it("returns the published entry when found", async () => {
    findPublishedEntryById.mockResolvedValue({ id: "entry-1", status: "published" });

    const { getEntry } = await import("./service");
    const result = await getEntry({ id: "entry-1" });

    expect(result).toEqual({ success: true, data: { id: "entry-1", status: "published" } });
  });

  it("returns null when the entry is not published (or does not exist)", async () => {
    findPublishedEntryById.mockResolvedValue(null);

    const { getEntry } = await import("./service");
    const result = await getEntry({ id: "draft-entry" });

    expect(result).toEqual({ success: true, data: null });
  });
});
