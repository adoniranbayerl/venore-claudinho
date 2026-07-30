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

const insertAvatarMediaFile = vi.fn();
vi.mock("./store", () => ({
  insertAvatarMediaFile: (...args: unknown[]) => insertAvatarMediaFile(...args),
}));

describe("uploadAvatarMedia", () => {
  beforeEach(() => {
    invalidateCacheByPrefix.mockReset();
    put.mockReset();
    insertAvatarMediaFile.mockReset();
  });

  it("always persists the row as private, even though the command carries no visibility field to override it", async () => {
    put.mockResolvedValue({ url: "/uploads/media/key-1-selfie.png" });
    insertAvatarMediaFile.mockResolvedValue({
      id: "media-1",
      filename: "selfie.png",
      storageKey: "key-1-selfie.png",
      mimeType: "image/png",
      size: 1024,
      url: "/uploads/media/key-1-selfie.png",
      uploadedBy: "actor-1",
      visibility: "private",
      createdAt: new Date(),
    });

    const { uploadAvatarMedia } = await import("./service");
    const result = await uploadAvatarMedia({
      filename: "selfie.png",
      mimeType: "image/png",
      size: 1024,
      data: Buffer.from("fake-bytes"),
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(insertAvatarMediaFile).toHaveBeenCalledWith(expect.objectContaining({ uploadedBy: "actor-1", visibility: "private" }));
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("media:files:");
  });
});
