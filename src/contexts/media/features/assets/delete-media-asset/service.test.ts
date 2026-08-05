import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const invalidateCacheByPrefix = vi.fn();
vi.mock("@/infrastructure/cache/memory-cache", () => ({
  invalidateCacheByPrefix: (...args: unknown[]) => invalidateCacheByPrefix(...args),
}));

const findAssetById = vi.fn();
const softDeleteAssetById = vi.fn();
vi.mock("./store", () => ({
  findAssetById: (...args: unknown[]) => findAssetById(...args),
  softDeleteAssetById: (...args: unknown[]) => softDeleteAssetById(...args),
}));

describe("deleteMediaAsset", () => {
  beforeEach(() => {
    invalidateCacheByPrefix.mockReset();
    findAssetById.mockReset();
    softDeleteAssetById.mockReset();
  });

  it("returns media.not_found when the asset does not exist", async () => {
    findAssetById.mockResolvedValue(null);

    const { deleteMediaAsset } = await import("./service");
    const result = await deleteMediaAsset({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "media.not_found", message: expect.any(String) },
    });
    expect(softDeleteAssetById).not.toHaveBeenCalled();
    expect(invalidateCacheByPrefix).not.toHaveBeenCalled();
  });

  it("soft-deletes the asset and invalidates the list cache", async () => {
    findAssetById.mockResolvedValue({ id: "asset-1", deletedAt: null });

    const { deleteMediaAsset } = await import("./service");
    const result = await deleteMediaAsset({ id: "asset-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "asset-1" } });
    expect(softDeleteAssetById).toHaveBeenCalledWith("asset-1");
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("media:assets:");
  });

  it("is idempotent for an already soft-deleted asset — no redundant write or cache invalidation", async () => {
    findAssetById.mockResolvedValue({ id: "asset-1", deletedAt: new Date("2026-01-01") });

    const { deleteMediaAsset } = await import("./service");
    const result = await deleteMediaAsset({ id: "asset-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "asset-1" } });
    expect(softDeleteAssetById).not.toHaveBeenCalled();
    expect(invalidateCacheByPrefix).not.toHaveBeenCalled();
  });
});
