import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const invalidateCacheByPrefix = vi.fn();
vi.mock("@/infrastructure/cache/memory-cache", () => ({
  invalidateCacheByPrefix: (...args: unknown[]) => invalidateCacheByPrefix(...args),
}));

const storeFn = vi.fn();
vi.mock("@/infrastructure/storage", () => ({
  storagePort: { store: (...args: unknown[]) => storeFn(...args) },
}));

const insertAsset = vi.fn();
vi.mock("./store", () => ({
  insertAsset: (...args: unknown[]) => insertAsset(...args),
}));

describe("uploadMediaAsset", () => {
  beforeEach(() => {
    invalidateCacheByPrefix.mockReset();
    storeFn.mockReset();
    insertAsset.mockReset();
  });

  it("rejects a contentType outside the allowlist without touching storage", async () => {
    const { uploadMediaAsset } = await import("./service");
    const result = await uploadMediaAsset({
      filename: "script.svg",
      contentType: "image/svg+xml",
      size: 100,
      data: Buffer.from("x"),
      visibility: "private",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "media.upload.unsupported_type", message: expect.any(String) },
    });
    expect(storeFn).not.toHaveBeenCalled();
    expect(insertAsset).not.toHaveBeenCalled();
  });

  it("rejects a file over the allowlist size limit for its type", async () => {
    const { uploadMediaAsset } = await import("./service");
    const result = await uploadMediaAsset({
      filename: "huge.png",
      contentType: "image/png",
      size: 9 * 1024 * 1024,
      data: Buffer.alloc(10),
      visibility: "private",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "media.upload.file_too_large", message: expect.any(String) },
    });
    expect(storeFn).not.toHaveBeenCalled();
  });

  it("stores the file via storagePort and persists filename/visibility/categoryId", async () => {
    storeFn.mockResolvedValue({ key: "uuid-photo.png", url: "https://blob.test/uuid-photo.png", size: 10 });
    insertAsset.mockResolvedValue({ id: "asset-1", filename: "photo.png" });

    const { uploadMediaAsset } = await import("./service");
    const data = Buffer.from("conteúdo");
    const result = await uploadMediaAsset({
      filename: "photo.png",
      contentType: "image/png",
      size: data.byteLength,
      data,
      visibility: "public",
      categoryId: "cat-1",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(insertAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "photo.png",
        pathname: "uuid-photo.png",
        url: "https://blob.test/uuid-photo.png",
        visibility: "public",
        categoryId: "cat-1",
        uploadedBy: "actor-1",
      }),
    );
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("media:assets:");
  });
});
