import { beforeEach, describe, expect, it, vi } from "vitest";

const listSoftDeletedAssetsOlderThan = vi.fn();
const purgeMediaAssetAsSystem = vi.fn();
vi.mock("@/contexts/media", () => ({
  listSoftDeletedAssetsOlderThan: (...args: unknown[]) => listSoftDeletedAssetsOlderThan(...args),
  purgeMediaAssetAsSystem: (...args: unknown[]) => purgeMediaAssetAsSystem(...args),
}));

const getSetting = vi.fn();
const registerDefaultSetting = vi.fn();
vi.mock("@/contexts/settings", () => ({
  getSetting: (...args: unknown[]) => getSetting(...args),
  registerDefaultSetting: (...args: unknown[]) => registerDefaultSetting(...args),
}));

const collectMediaUsage = vi.fn();
vi.mock("@/platform/media-usage/media-usage-registry", () => ({
  collectMediaUsage: (...args: unknown[]) => collectMediaUsage(...args),
}));

describe("sweepSoftDeletedMedia", () => {
  beforeEach(() => {
    listSoftDeletedAssetsOlderThan.mockReset();
    purgeMediaAssetAsSystem.mockReset();
    getSetting.mockReset();
    registerDefaultSetting.mockReset().mockResolvedValue({ success: true, data: { key: "media.softDeleteGraceDays", value: 3 } });
    collectMediaUsage.mockReset();
  });

  it("uses the 3-day default grace period when no setting is stored yet", async () => {
    getSetting.mockResolvedValue({ success: true, data: null });
    listSoftDeletedAssetsOlderThan.mockResolvedValue([]);

    const { sweepSoftDeletedMedia } = await import("./sweep-soft-deleted-media");
    const now = new Date("2026-08-10T00:00:00.000Z");
    await sweepSoftDeletedMedia(now);

    expect(registerDefaultSetting).toHaveBeenCalledWith({ key: "media.softDeleteGraceDays", value: 3 });
    expect(listSoftDeletedAssetsOlderThan).toHaveBeenCalledWith(new Date("2026-08-07T00:00:00.000Z"));
  });

  it("respects a stored grace period override", async () => {
    getSetting.mockResolvedValue({ success: true, data: { key: "media.softDeleteGraceDays", value: 7 } });
    listSoftDeletedAssetsOlderThan.mockResolvedValue([]);

    const { sweepSoftDeletedMedia } = await import("./sweep-soft-deleted-media");
    const now = new Date("2026-08-10T00:00:00.000Z");
    await sweepSoftDeletedMedia(now);

    expect(listSoftDeletedAssetsOlderThan).toHaveBeenCalledWith(new Date("2026-08-03T00:00:00.000Z"));
  });

  it("purges a candidate with no remaining usage, and skips one that's still referenced", async () => {
    getSetting.mockResolvedValue({ success: true, data: { key: "media.softDeleteGraceDays", value: 3 } });
    listSoftDeletedAssetsOlderThan.mockResolvedValue([
      { id: "free-asset", filename: "old.png" },
      { id: "referenced-asset", filename: "still-used.png" },
    ]);
    collectMediaUsage.mockImplementation(async (id: string) =>
      id === "referenced-asset" ? [{ consumerKey: "cms", consumerLabel: "CMS", label: "Entry: X", href: "/x" }] : [],
    );
    purgeMediaAssetAsSystem.mockResolvedValue({ success: true, data: { id: "free-asset" } });

    const { sweepSoftDeletedMedia } = await import("./sweep-soft-deleted-media");
    const result = await sweepSoftDeletedMedia(new Date("2026-08-10T00:00:00.000Z"));

    expect(result).toEqual({ purged: 1, skipped: 1 });
    expect(purgeMediaAssetAsSystem).toHaveBeenCalledTimes(1);
    expect(purgeMediaAssetAsSystem).toHaveBeenCalledWith({ id: "free-asset", actorId: "system" });
  });
});
