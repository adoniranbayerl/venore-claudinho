import { beforeEach, describe, expect, it, vi } from "vitest";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";

const findPublishedEntryByCategoryAndSlug = vi.fn();

vi.mock("./store", () => ({
  findPublishedEntryByCategoryAndSlug: (...args: unknown[]) => findPublishedEntryByCategoryAndSlug(...args),
}));

describe("getPublishedEntryBySlug", () => {
  beforeEach(() => {
    findPublishedEntryByCategoryAndSlug.mockReset();
    invalidateCacheByPrefix("cms:entries:published");
  });

  it("reads the store and populates the cache on a cache miss", async () => {
    findPublishedEntryByCategoryAndSlug.mockResolvedValue({ id: "entry-1", status: "published" });

    const { getPublishedEntryBySlug } = await import("./service");
    const result = await getPublishedEntryBySlug({ categoryId: null, slug: "home" });

    expect(findPublishedEntryByCategoryAndSlug).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: { id: "entry-1", status: "published" } });
  });

  it("does not hit the store again on a cache hit for the same categoryId/slug", async () => {
    findPublishedEntryByCategoryAndSlug.mockResolvedValue({ id: "entry-1", status: "published" });

    const { getPublishedEntryBySlug } = await import("./service");
    await getPublishedEntryBySlug({ categoryId: "cat-1", slug: "hello" });
    await getPublishedEntryBySlug({ categoryId: "cat-1", slug: "hello" });

    expect(findPublishedEntryByCategoryAndSlug).toHaveBeenCalledTimes(1);
  });

  it("also caches a not-found result instead of hitting the store again", async () => {
    findPublishedEntryByCategoryAndSlug.mockResolvedValue(null);

    const { getPublishedEntryBySlug } = await import("./service");
    const first = await getPublishedEntryBySlug({ categoryId: null, slug: "missing" });
    const second = await getPublishedEntryBySlug({ categoryId: null, slug: "missing" });

    expect(findPublishedEntryByCategoryAndSlug).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ success: true, data: null });
    expect(second).toEqual({ success: true, data: null });
  });

  it("treats different categoryId/slug combinations as different cache entries", async () => {
    findPublishedEntryByCategoryAndSlug.mockResolvedValue(null);

    const { getPublishedEntryBySlug } = await import("./service");
    await getPublishedEntryBySlug({ categoryId: "cat-1", slug: "hello" });
    await getPublishedEntryBySlug({ categoryId: "cat-2", slug: "hello" });
    await getPublishedEntryBySlug({ categoryId: null, slug: "hello" });

    expect(findPublishedEntryByCategoryAndSlug).toHaveBeenCalledTimes(3);
  });
});
