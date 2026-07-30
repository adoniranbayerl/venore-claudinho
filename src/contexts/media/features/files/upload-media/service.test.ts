import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const invalidateCacheByPrefix = vi.fn();

vi.mock("@/infrastructure/cache/memory-cache", () => ({
  invalidateCacheByPrefix: (...args: unknown[]) => invalidateCacheByPrefix(...args),
}));

const put = vi.fn();

vi.mock("@/infrastructure/storage", () => ({
  storageAdapter: { put: (...args: unknown[]) => put(...args) },
}));

const insertMediaFile = vi.fn();

vi.mock("./store", () => ({
  insertMediaFile: (...args: unknown[]) => insertMediaFile(...args),
}));

describe("uploadMedia", () => {
  beforeEach(() => {
    invalidateCacheByPrefix.mockReset();
    put.mockReset();
    insertMediaFile.mockReset();
  });

  it("stores the file via the storage adapter and persists the metadata", async () => {
    put.mockResolvedValue({ url: "/uploads/media/key-1-photo.png" });
    insertMediaFile.mockResolvedValue({
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

    const { uploadMedia } = await import("./service");
    const result = await uploadMedia({
      filename: "photo.png",
      mimeType: "image/png",
      size: 1024,
      data: Buffer.from("fake-bytes"),
      actorId: "actor-1",
      visibility: "private",
    });

    expect(result.success).toBe(true);
    expect(put).toHaveBeenCalledTimes(1);
    expect(insertMediaFile).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "photo.png",
        mimeType: "image/png",
        size: 1024,
        url: "/uploads/media/key-1-photo.png",
        uploadedBy: "actor-1",
        visibility: "private",
      }),
    );
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("media:files:");
  });

  it("persists the file as public when visibility is explicitly set to public", async () => {
    put.mockResolvedValue({ url: "/uploads/media/key-2-logo.png" });
    insertMediaFile.mockResolvedValue({
      id: "media-2",
      filename: "logo.png",
      storageKey: "key-2-logo.png",
      mimeType: "image/png",
      size: 512,
      url: "/uploads/media/key-2-logo.png",
      uploadedBy: "actor-1",
      visibility: "public",
      createdAt: new Date(),
    });

    const { uploadMedia } = await import("./service");
    await uploadMedia({
      filename: "logo.png",
      mimeType: "image/png",
      size: 512,
      data: Buffer.from("fake-bytes"),
      actorId: "actor-1",
      visibility: "public",
    });

    expect(insertMediaFile).toHaveBeenCalledWith(expect.objectContaining({ visibility: "public" }));
  });
});
