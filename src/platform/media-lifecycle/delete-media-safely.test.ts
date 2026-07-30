import { beforeEach, describe, expect, it, vi } from "vitest";

const collectMediaUsage = vi.fn();
const deleteMedia = vi.fn();

vi.mock("@/platform/media-usage/media-usage-registry", () => ({
  collectMediaUsage: (...args: unknown[]) => collectMediaUsage(...args),
}));

vi.mock("@/contexts/media", () => ({
  deleteMedia: (...args: unknown[]) => deleteMedia(...args),
}));

describe("deleteMediaSafely", () => {
  beforeEach(() => {
    collectMediaUsage.mockReset();
    deleteMedia.mockReset();
  });

  it("requires confirmation instead of deleting when the media is in use and not yet confirmed", async () => {
    collectMediaUsage.mockResolvedValue([
      { consumerKey: "cms", consumerLabel: "CMS", label: "Entry: Home", href: "/admin/cms/entries/1" },
    ]);

    const { deleteMediaSafely } = await import("./delete-media-safely");
    const result = await deleteMediaSafely({ id: "media-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "media.delete.confirmation_required", message: expect.stringContaining("1 local") },
    });
    expect(deleteMedia).not.toHaveBeenCalled();
  });

  it("deletes the media once the caller confirms deletion despite it being in use", async () => {
    collectMediaUsage.mockResolvedValue([
      { consumerKey: "cms", consumerLabel: "CMS", label: "Entry: Home", href: "/admin/cms/entries/1" },
    ]);
    deleteMedia.mockResolvedValue({ success: true, data: { id: "media-1" } });

    const { deleteMediaSafely } = await import("./delete-media-safely");
    const result = await deleteMediaSafely({ id: "media-1", confirmed: true });

    expect(result).toEqual({ success: true, data: { id: "media-1" } });
    expect(deleteMedia).toHaveBeenCalledWith({ id: "media-1" });
  });

  it("deletes the media directly when it is not referenced anywhere", async () => {
    collectMediaUsage.mockResolvedValue([]);
    deleteMedia.mockResolvedValue({ success: true, data: { id: "media-1" } });

    const { deleteMediaSafely } = await import("./delete-media-safely");
    const result = await deleteMediaSafely({ id: "media-1" });

    expect(result).toEqual({ success: true, data: { id: "media-1" } });
    expect(deleteMedia).toHaveBeenCalledWith({ id: "media-1" });
  });
});
