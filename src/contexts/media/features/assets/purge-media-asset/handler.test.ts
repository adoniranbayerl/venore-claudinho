import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const purgeMediaAsset = vi.fn();
vi.mock("./service", () => ({
  purgeMediaAsset: (...args: unknown[]) => purgeMediaAsset(...args),
}));

describe("purgeMediaAssetHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    purgeMediaAsset.mockReset();
  });

  it("rejects an empty id without checking authorization", async () => {
    const { purgeMediaAssetHandler } = await import("./handler");
    const result = await purgeMediaAssetHandler({ id: "  " });

    expect(result).toEqual({
      success: false,
      error: { code: "media.purge.invalid_id", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("requires media.purge — media.manage alone is not enough", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: 'Ator não tem a permission "media.purge".' },
    });

    const { purgeMediaAssetHandler } = await import("./handler");
    const result = await purgeMediaAssetHandler({ id: "asset-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: 'Ator não tem a permission "media.purge".' },
    });
    expect(authorizeActor).toHaveBeenCalledWith("media.purge");
    expect(purgeMediaAsset).not.toHaveBeenCalled();
  });

  it("delegates to the service with the authorized actorId", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    purgeMediaAsset.mockResolvedValue({ success: true, data: { id: "asset-1" } });

    const { purgeMediaAssetHandler } = await import("./handler");
    const result = await purgeMediaAssetHandler({ id: "asset-1" });

    expect(result).toEqual({ success: true, data: { id: "asset-1" } });
    expect(purgeMediaAsset).toHaveBeenCalledWith({ id: "asset-1", actorId: "actor-1" });
  });
});
