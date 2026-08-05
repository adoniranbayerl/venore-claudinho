import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const invalidateCacheByPrefix = vi.fn();
const invalidateCache = vi.fn();
vi.mock("../../../../../infrastructure/cache/memory-cache", () => ({
  invalidateCacheByPrefix: (...args: unknown[]) => invalidateCacheByPrefix(...args),
  invalidateCache: (...args: unknown[]) => invalidateCache(...args),
}));

const getMediaAsset = vi.fn();

vi.mock("@/contexts/media", () => ({
  getMediaAsset: (...args: unknown[]) => getMediaAsset(...args),
}));

const findEntryById = vi.fn();
const findOtherEntryByCategoryAndSlug = vi.fn();
const updateEntryFields = vi.fn();

vi.mock("./store", () => ({
  findEntryById: (...args: unknown[]) => findEntryById(...args),
  findOtherEntryByCategoryAndSlug: (...args: unknown[]) => findOtherEntryByCategoryAndSlug(...args),
  updateEntryFields: (...args: unknown[]) => updateEntryFields(...args),
}));

const existingEntry = {
  id: "entry-1",
  contentTypeId: "ct-1",
  categoryId: null,
  title: "Hello",
  slug: "hello",
  status: "draft",
  data: {},
  mediaId: null,
  authorId: "actor-1",
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("updateEntry", () => {
  beforeEach(() => {
    findEntryById.mockReset();
    findOtherEntryByCategoryAndSlug.mockReset();
    findOtherEntryByCategoryAndSlug.mockResolvedValue(null);
    updateEntryFields.mockReset();
    getMediaAsset.mockReset();
    invalidateCacheByPrefix.mockReset();
    invalidateCache.mockReset();
  });

  it("invalidates the tag entryCount cache when contentTypeIds changes", async () => {
    findEntryById.mockResolvedValue(existingEntry);
    updateEntryFields.mockResolvedValue({ ...existingEntry, contentTypeIds: ["ct-2"] });

    const { updateEntry } = await import("./service");
    await updateEntry({ id: "entry-1", contentTypeIds: ["ct-2"], actorId: "actor-1" });

    expect(invalidateCache).toHaveBeenCalledWith("cms:content-types");
  });

  it("does not touch the tag entryCount cache when contentTypeIds is not part of the update", async () => {
    findEntryById.mockResolvedValue(existingEntry);
    updateEntryFields.mockResolvedValue({ ...existingEntry, title: "Updated" });

    const { updateEntry } = await import("./service");
    await updateEntry({ id: "entry-1", title: "Updated", actorId: "actor-1" });

    expect(invalidateCache).not.toHaveBeenCalled();
  });

  it("invalidates the navigation cache when a published entry's address (slug) changes", async () => {
    findEntryById.mockResolvedValue({ ...existingEntry, status: "published" });
    updateEntryFields.mockResolvedValue({ ...existingEntry, status: "published", slug: "novo-slug" });

    const { updateEntry } = await import("./service");
    await updateEntry({ id: "entry-1", slug: "novo-slug", actorId: "actor-1" });

    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("cms:navigation");
  });

  it("does not touch the navigation cache when a draft entry changes (nothing was navigable yet)", async () => {
    findEntryById.mockResolvedValue({ ...existingEntry, status: "draft" });
    updateEntryFields.mockResolvedValue({ ...existingEntry, status: "draft", slug: "novo-slug" });

    const { updateEntry } = await import("./service");
    await updateEntry({ id: "entry-1", slug: "novo-slug", actorId: "actor-1" });

    expect(invalidateCacheByPrefix).not.toHaveBeenCalledWith("cms:navigation");
  });

  it("fails when the entry does not exist", async () => {
    findEntryById.mockResolvedValue(null);

    const { updateEntry } = await import("./service");
    const result = await updateEntry({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.entries.not_found", message: expect.any(String) },
    });
    expect(updateEntryFields).not.toHaveBeenCalled();
  });

  it("fails when mediaId does not reference an existing media file", async () => {
    findEntryById.mockResolvedValue(existingEntry);
    getMediaAsset.mockResolvedValue({ success: true, data: null });

    const { updateEntry } = await import("./service");
    const result = await updateEntry({ id: "entry-1", mediaId: "media-missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.entries.invalid_media", message: expect.any(String) },
    });
    expect(updateEntryFields).not.toHaveBeenCalled();
  });

  it("updates the entry when mediaId references an existing media file", async () => {
    findEntryById.mockResolvedValue(existingEntry);
    getMediaAsset.mockResolvedValue({ success: true, data: { id: "media-1" } });
    updateEntryFields.mockResolvedValue({ ...existingEntry, mediaId: "media-1" });

    const { updateEntry } = await import("./service");
    const result = await updateEntry({ id: "entry-1", mediaId: "media-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(getMediaAsset).toHaveBeenCalledWith({ id: "media-1" });
  });

  it("skips media validation when mediaId is not provided", async () => {
    findEntryById.mockResolvedValue(existingEntry);
    updateEntryFields.mockResolvedValue({ ...existingEntry, title: "Updated" });

    const { updateEntry } = await import("./service");
    const result = await updateEntry({ id: "entry-1", title: "Updated", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(getMediaAsset).not.toHaveBeenCalled();
  });

  it("fails when the new slug/category combination is already taken by another entry", async () => {
    findEntryById.mockResolvedValue(existingEntry);
    findOtherEntryByCategoryAndSlug.mockResolvedValue({ id: "other-entry" });

    const { updateEntry } = await import("./service");
    const result = await updateEntry({ id: "entry-1", slug: "taken", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.entries.slug_taken", message: expect.any(String) },
    });
    expect(updateEntryFields).not.toHaveBeenCalled();
  });

  it("checks duplicates against the effective (post-update) categoryId and slug, excluding itself", async () => {
    findEntryById.mockResolvedValue(existingEntry);
    updateEntryFields.mockResolvedValue({ ...existingEntry, categoryId: "cat-1", slug: "new-slug" });

    const { updateEntry } = await import("./service");
    await updateEntry({ id: "entry-1", categoryId: "cat-1", slug: "new-slug", actorId: "actor-1" });

    expect(findOtherEntryByCategoryAndSlug).toHaveBeenCalledWith("entry-1", "cat-1", "new-slug");
  });

  it("does not flag a collision with itself when saving without changing slug/category", async () => {
    findEntryById.mockResolvedValue(existingEntry);
    updateEntryFields.mockResolvedValue({ ...existingEntry, title: "Updated" });

    const { updateEntry } = await import("./service");
    const result = await updateEntry({ id: "entry-1", title: "Updated", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(findOtherEntryByCategoryAndSlug).toHaveBeenCalledWith("entry-1", existingEntry.categoryId, existingEntry.slug);
  });
});
