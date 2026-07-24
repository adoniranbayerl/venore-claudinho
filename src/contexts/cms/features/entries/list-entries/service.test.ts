import { beforeEach, describe, expect, it, vi } from "vitest";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";

const findPublishedEntries = vi.fn();

vi.mock("./store", () => ({
  findPublishedEntries: (...args: unknown[]) => findPublishedEntries(...args),
}));

describe("listEntries", () => {
  beforeEach(() => {
    findPublishedEntries.mockReset();
    invalidateCacheByPrefix("cms:entries:published");
  });

  it("reads the store and populates the cache on a cache miss", async () => {
    findPublishedEntries.mockResolvedValue([{ id: "entry-1", status: "published" }]);

    const { listEntries } = await import("./service");
    const result = await listEntries({});

    expect(findPublishedEntries).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: [{ id: "entry-1", status: "published" }] });
  });

  it("does not hit the store again on a cache hit for the same filters", async () => {
    findPublishedEntries.mockResolvedValue([{ id: "entry-1", status: "published" }]);

    const { listEntries } = await import("./service");
    await listEntries({ contentTypeId: "ct-1" });
    await listEntries({ contentTypeId: "ct-1" });

    expect(findPublishedEntries).toHaveBeenCalledTimes(1);
  });

  it("treats different filters as different cache entries", async () => {
    findPublishedEntries.mockResolvedValue([]);

    const { listEntries } = await import("./service");
    await listEntries({ contentTypeId: "ct-1" });
    await listEntries({ contentTypeId: "ct-2" });

    expect(findPublishedEntries).toHaveBeenCalledTimes(2);
  });
});
