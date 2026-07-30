import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const invalidateCacheByPrefix = vi.fn();

vi.mock("@/infrastructure/cache/memory-cache", () => ({
  invalidateCacheByPrefix: (...args: unknown[]) => invalidateCacheByPrefix(...args),
}));

const del = vi.fn();

vi.mock("@/infrastructure/storage", () => ({
  storageAdapter: { delete: (...args: unknown[]) => del(...args) },
}));

const findMediaById = vi.fn();
const deleteMediaById = vi.fn();

vi.mock("./store", () => ({
  findMediaById: (...args: unknown[]) => findMediaById(...args),
  deleteMediaById: (...args: unknown[]) => deleteMediaById(...args),
}));

describe("deleteMedia", () => {
  beforeEach(() => {
    invalidateCacheByPrefix.mockReset();
    del.mockReset();
    findMediaById.mockReset();
    deleteMediaById.mockReset();
  });

  it("fails when the media file does not exist", async () => {
    findMediaById.mockResolvedValue(null);

    const { deleteMedia } = await import("./service");
    const result = await deleteMedia({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "media.not_found", message: expect.any(String) },
    });
    expect(del).not.toHaveBeenCalled();
    expect(deleteMediaById).not.toHaveBeenCalled();
  });

  it("removes the file from storage and the metadata row when it exists", async () => {
    findMediaById.mockResolvedValue({
      id: "media-1",
      filename: "photo.png",
      storageKey: "key-1-photo.png",
      mimeType: "image/png",
      size: 1024,
      url: "/uploads/media/key-1-photo.png",
      uploadedBy: "actor-1",
      visibility: "private",
      createdAt: new Date(),
    });

    const { deleteMedia } = await import("./service");
    const result = await deleteMedia({ id: "media-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "media-1" } });
    expect(del).toHaveBeenCalledWith("key-1-photo.png");
    expect(deleteMediaById).toHaveBeenCalledWith("media-1");
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("media:files:");
  });
});
