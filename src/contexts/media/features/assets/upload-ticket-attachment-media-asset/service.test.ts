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

describe("uploadTicketAttachmentMediaAsset", () => {
  beforeEach(() => {
    invalidateCacheByPrefix.mockReset();
    storeFn.mockReset();
    insertAsset.mockReset();
    getOrCreateReservedCategory.mockReset();
  });

  it("always uploads as private, in the reserved ticket-attachments category", async () => {
    getOrCreateReservedCategory.mockResolvedValue({ id: "cat-tickets", key: "ticket-attachments", name: "Anexos de chamado" });
    storeFn.mockResolvedValue({ key: "uuid-photo.jpg", url: "https://blob.test/uuid-photo.jpg", size: 42 });
    insertAsset.mockResolvedValue({ id: "asset-1" });

    const { uploadTicketAttachmentMediaAsset } = await import("./service");
    const data = Buffer.from("image-bytes");
    await uploadTicketAttachmentMediaAsset({
      filename: "photo.jpg",
      contentType: "image/jpeg",
      size: data.byteLength,
      data,
      actorId: "actor-1",
    });

    expect(getOrCreateReservedCategory).toHaveBeenCalledWith("ticket-attachments", "Anexos de chamado");
    expect(insertAsset).toHaveBeenCalledWith(
      expect.objectContaining({ visibility: "private", categoryId: "cat-tickets", uploadedBy: "actor-1" }),
    );
  });

  it("invalidates the assets list cache after a successful upload", async () => {
    getOrCreateReservedCategory.mockResolvedValue({ id: "cat-tickets", key: "ticket-attachments", name: "Anexos de chamado" });
    storeFn.mockResolvedValue({ key: "uuid-photo.jpg", url: "https://blob.test/uuid-photo.jpg", size: 10 });
    insertAsset.mockResolvedValue({ id: "asset-1" });

    const { uploadTicketAttachmentMediaAsset } = await import("./service");
    await uploadTicketAttachmentMediaAsset({
      filename: "photo.jpg",
      contentType: "image/jpeg",
      size: 10,
      data: Buffer.alloc(10),
      actorId: "actor-1",
    });

    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("media:assets:");
  });
});
