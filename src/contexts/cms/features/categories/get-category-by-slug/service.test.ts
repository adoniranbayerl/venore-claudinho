import { beforeEach, describe, expect, it, vi } from "vitest";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";

const findCategoryBySlug = vi.fn();

vi.mock("./store", () => ({
  findCategoryBySlug: (...args: unknown[]) => findCategoryBySlug(...args),
}));

describe("getCategoryBySlug", () => {
  beforeEach(() => {
    findCategoryBySlug.mockReset();
    invalidateCacheByPrefix("cms:categories");
  });

  it("reads the store and populates the cache on a cache miss", async () => {
    findCategoryBySlug.mockResolvedValue({ id: "cat-1", slug: "eventos" });

    const { getCategoryBySlug } = await import("./service");
    const result = await getCategoryBySlug({ slug: "eventos" });

    expect(findCategoryBySlug).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data: { id: "cat-1", slug: "eventos" } });
  });

  it("does not hit the store again on a cache hit for the same slug", async () => {
    findCategoryBySlug.mockResolvedValue({ id: "cat-1", slug: "eventos" });

    const { getCategoryBySlug } = await import("./service");
    await getCategoryBySlug({ slug: "eventos" });
    await getCategoryBySlug({ slug: "eventos" });

    expect(findCategoryBySlug).toHaveBeenCalledTimes(1);
  });

  it("also caches a not-found result instead of hitting the store again", async () => {
    findCategoryBySlug.mockResolvedValue(null);

    const { getCategoryBySlug } = await import("./service");
    const first = await getCategoryBySlug({ slug: "missing" });
    const second = await getCategoryBySlug({ slug: "missing" });

    expect(findCategoryBySlug).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ success: true, data: null });
    expect(second).toEqual({ success: true, data: null });
  });
});
