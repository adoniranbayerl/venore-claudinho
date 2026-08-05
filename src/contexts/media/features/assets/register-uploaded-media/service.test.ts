import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findAssetByPathname = vi.fn();
const findActiveAssetByChecksum = vi.fn();
const insertAssetIfAbsent = vi.fn();
vi.mock("./store", () => ({
  findAssetByPathname: (...args: unknown[]) => findAssetByPathname(...args),
  findActiveAssetByChecksum: (...args: unknown[]) => findActiveAssetByChecksum(...args),
  insertAssetIfAbsent: (...args: unknown[]) => insertAssetIfAbsent(...args),
}));

const baseCommand = {
  filename: "photo.png",
  pathname: "uuid-1-photo.png",
  url: "https://example.blob.vercel-storage.com/uuid-1-photo.png",
  contentType: "image/png",
  size: 1024,
  checksum: "checksum-1",
  actorId: "actor-1",
};

const existingAsset = {
  id: "asset-1",
  filename: baseCommand.filename,
  pathname: baseCommand.pathname,
  url: baseCommand.url,
  contentType: baseCommand.contentType,
  size: baseCommand.size,
  width: null,
  height: null,
  alt: null,
  checksum: baseCommand.checksum,
  uploadedBy: "actor-1",
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("registerUploadedMedia", () => {
  beforeEach(() => {
    findAssetByPathname.mockReset();
    findActiveAssetByChecksum.mockReset();
    insertAssetIfAbsent.mockReset();
  });

  it("registrar duas vezes o mesmo blob não cria dois registros — retorna a linha existente sem inserir de novo", async () => {
    findAssetByPathname.mockResolvedValue(existingAsset);

    const { registerUploadedMedia } = await import("./service");
    const result = await registerUploadedMedia(baseCommand);

    expect(result).toEqual({ success: true, data: existingAsset });
    expect(insertAssetIfAbsent).not.toHaveBeenCalled();
  });

  it("dedupes by checksum against an active asset when the pathname is new", async () => {
    findAssetByPathname.mockResolvedValue(null);
    findActiveAssetByChecksum.mockResolvedValue(existingAsset);

    const { registerUploadedMedia } = await import("./service");
    const result = await registerUploadedMedia({ ...baseCommand, pathname: "uuid-2-photo-copy.png" });

    expect(result).toEqual({ success: true, data: existingAsset });
    expect(insertAssetIfAbsent).not.toHaveBeenCalled();
  });

  it("does not reuse a checksum match that belongs to a soft-deleted asset", async () => {
    findAssetByPathname.mockResolvedValue(null);
    findActiveAssetByChecksum.mockResolvedValue(null); // store already excludes deletedAt rows
    insertAssetIfAbsent.mockResolvedValue({ ...existingAsset, id: "asset-2", pathname: "uuid-3-photo.png" });

    const { registerUploadedMedia } = await import("./service");
    const result = await registerUploadedMedia({ ...baseCommand, pathname: "uuid-3-photo.png" });

    expect(result.success).toBe(true);
    expect(insertAssetIfAbsent).toHaveBeenCalled();
  });

  it("inserts a new row on the first registration", async () => {
    findAssetByPathname.mockResolvedValue(null);
    findActiveAssetByChecksum.mockResolvedValue(null);
    insertAssetIfAbsent.mockResolvedValue(existingAsset);

    const { registerUploadedMedia } = await import("./service");
    const result = await registerUploadedMedia(baseCommand);

    expect(result).toEqual({ success: true, data: existingAsset });
    expect(insertAssetIfAbsent).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: baseCommand.pathname, checksum: baseCommand.checksum, uploadedBy: "actor-1" }),
    );
  });

  it("falls back to a re-fetch by pathname when a concurrent insert wins the unique-index race", async () => {
    findAssetByPathname.mockResolvedValueOnce(null).mockResolvedValueOnce(existingAsset);
    findActiveAssetByChecksum.mockResolvedValue(null);
    insertAssetIfAbsent.mockResolvedValue(null); // onConflictDoNothing returned nothing

    const { registerUploadedMedia } = await import("./service");
    const result = await registerUploadedMedia(baseCommand);

    expect(result).toEqual({ success: true, data: existingAsset });
    expect(findAssetByPathname).toHaveBeenCalledTimes(2);
  });
});
