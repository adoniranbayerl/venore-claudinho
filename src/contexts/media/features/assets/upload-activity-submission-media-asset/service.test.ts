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
vi.mock("../upload-media-asset/store", () => ({
  insertAsset: (...args: unknown[]) => insertAsset(...args),
}));

const getOrCreateReservedCategory = vi.fn();
vi.mock("../../../get-or-create-reserved-category", () => ({
  getOrCreateReservedCategory: (...args: unknown[]) => getOrCreateReservedCategory(...args),
}));

describe("uploadActivitySubmissionMediaAsset", () => {
  beforeEach(() => {
    invalidateCacheByPrefix.mockReset();
    storeFn.mockReset();
    insertAsset.mockReset();
    getOrCreateReservedCategory.mockReset();
  });

  it("always uploads as private, in the reserved activity-submissions category", async () => {
    getOrCreateReservedCategory.mockResolvedValue({ id: "cat-submissions", key: "activity-submissions", name: "Entregas de atividade" });
    storeFn.mockResolvedValue({ key: "uuid-recording.mp3", url: "https://blob.test/uuid-recording.mp3", size: 10 });
    insertAsset.mockResolvedValue({ id: "asset-1" });

    const { uploadActivitySubmissionMediaAsset } = await import("./service");
    const data = Buffer.from("audio-bytes");
    await uploadActivitySubmissionMediaAsset({
      filename: "recording.mp3",
      contentType: "audio/mpeg",
      size: data.byteLength,
      data,
      actorId: "actor-1",
    });

    expect(getOrCreateReservedCategory).toHaveBeenCalledWith("activity-submissions", "Entregas de atividade");
    expect(insertAsset).toHaveBeenCalledWith(
      expect.objectContaining({ visibility: "private", categoryId: "cat-submissions", uploadedBy: "actor-1" }),
    );
  });

  it("invalidates the assets list cache after a successful upload", async () => {
    getOrCreateReservedCategory.mockResolvedValue({ id: "cat-submissions", key: "activity-submissions", name: "Entregas de atividade" });
    storeFn.mockResolvedValue({ key: "uuid-recording.mp3", url: "https://blob.test/uuid-recording.mp3", size: 10 });
    insertAsset.mockResolvedValue({ id: "asset-1" });

    const { uploadActivitySubmissionMediaAsset } = await import("./service");
    await uploadActivitySubmissionMediaAsset({
      filename: "recording.mp3",
      contentType: "audio/mpeg",
      size: 10,
      data: Buffer.alloc(10),
      actorId: "actor-1",
    });

    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("media:assets:");
  });
});
