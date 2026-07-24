import { beforeEach, describe, expect, it, vi } from "vitest";

const findAnyEntryByMediaId = vi.fn();

vi.mock("./store", () => ({
  findAnyEntryByMediaId: (...args: unknown[]) => findAnyEntryByMediaId(...args),
}));

describe("isMediaReferenced", () => {
  beforeEach(() => {
    findAnyEntryByMediaId.mockReset();
  });

  it("returns true when at least one entry references the media", async () => {
    findAnyEntryByMediaId.mockResolvedValue(true);

    const { isMediaReferenced } = await import("./service");
    const result = await isMediaReferenced({ mediaId: "media-1" });

    expect(result).toEqual({ success: true, data: true });
  });

  it("returns false when no entry references the media", async () => {
    findAnyEntryByMediaId.mockResolvedValue(false);

    const { isMediaReferenced } = await import("./service");
    const result = await isMediaReferenced({ mediaId: "media-1" });

    expect(result).toEqual({ success: true, data: false });
  });
});
