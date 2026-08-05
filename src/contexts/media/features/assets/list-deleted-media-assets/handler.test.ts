import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const listDeletedMediaAssets = vi.fn();
vi.mock("./service", () => ({
  listDeletedMediaAssets: (...args: unknown[]) => listDeletedMediaAssets(...args),
}));

describe("listDeletedMediaAssetsHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    listDeletedMediaAssets.mockReset();
  });

  it("requires media.purge — media.manage alone is not enough to browse the trash", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: 'Ator não tem a permission "media.purge".' },
    });

    const { listDeletedMediaAssetsHandler } = await import("./handler");
    const result = await listDeletedMediaAssetsHandler();

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: 'Ator não tem a permission "media.purge".' },
    });
    expect(authorizeActor).toHaveBeenCalledWith("media.purge");
    expect(listDeletedMediaAssets).not.toHaveBeenCalled();
  });

  it("delegates to the service once authorized", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    listDeletedMediaAssets.mockResolvedValue({ success: true, data: [] });

    const { listDeletedMediaAssetsHandler } = await import("./handler");
    const result = await listDeletedMediaAssetsHandler();

    expect(result).toEqual({ success: true, data: [] });
  });
});
