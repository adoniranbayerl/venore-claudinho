import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

vi.mock("../../../../../infrastructure/cache/memory-cache", () => ({
  invalidateCacheByPrefix: vi.fn(),
}));

const getMedia = vi.fn();

vi.mock("@/contexts/media", () => ({
  getMedia: (...args: unknown[]) => getMedia(...args),
}));

const findEntryById = vi.fn();
const updateEntryFields = vi.fn();

vi.mock("./store", () => ({
  findEntryById: (...args: unknown[]) => findEntryById(...args),
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
    updateEntryFields.mockReset();
    getMedia.mockReset();
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
    getMedia.mockResolvedValue({ success: true, data: null });

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
    getMedia.mockResolvedValue({ success: true, data: { id: "media-1" } });
    updateEntryFields.mockResolvedValue({ ...existingEntry, mediaId: "media-1" });

    const { updateEntry } = await import("./service");
    const result = await updateEntry({ id: "entry-1", mediaId: "media-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(getMedia).toHaveBeenCalledWith({ id: "media-1" });
  });

  it("skips media validation when mediaId is not provided", async () => {
    findEntryById.mockResolvedValue(existingEntry);
    updateEntryFields.mockResolvedValue({ ...existingEntry, title: "Updated" });

    const { updateEntry } = await import("./service");
    const result = await updateEntry({ id: "entry-1", title: "Updated", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(getMedia).not.toHaveBeenCalled();
  });
});
