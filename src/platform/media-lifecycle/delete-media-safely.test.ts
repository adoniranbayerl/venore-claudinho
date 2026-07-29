import { beforeEach, describe, expect, it, vi } from "vitest";

const isMediaReferenced = vi.fn();
const deleteMedia = vi.fn();
const getSetting = vi.fn();

vi.mock("@/contexts/cms", () => ({
  isMediaReferenced: (...args: unknown[]) => isMediaReferenced(...args),
}));

vi.mock("@/contexts/media", () => ({
  deleteMedia: (...args: unknown[]) => deleteMedia(...args),
}));

// isMediaReferencedByBrand (checado depois de isMediaReferenced) lê contexts/settings — mockado
// aqui pra não carregar o barrel de verdade (que reexporta setSetting, que puxa
// contexts/rbac -> contexts/auth -> auth.config.ts e o NextAuth() top-level, indisponível fora
// do bundler do Next, mesmo gotcha documentado em AGENTS.md pro barrel de contexts/cms).
vi.mock("@/contexts/settings", () => ({
  getSetting: (...args: unknown[]) => getSetting(...args),
}));

describe("deleteMediaSafely", () => {
  beforeEach(() => {
    isMediaReferenced.mockReset();
    deleteMedia.mockReset();
    getSetting.mockReset();
    getSetting.mockResolvedValue({ success: true, data: null });
  });

  it("blocks deletion when the media file is referenced by a cms entry", async () => {
    isMediaReferenced.mockResolvedValue({ success: true, data: true });

    const { deleteMediaSafely } = await import("./delete-media-safely");
    const result = await deleteMediaSafely({ id: "media-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "media.delete.in_use", message: expect.any(String) },
    });
    expect(deleteMedia).not.toHaveBeenCalled();
  });

  it("deletes the media file when it is not referenced by any cms entry", async () => {
    isMediaReferenced.mockResolvedValue({ success: true, data: false });
    deleteMedia.mockResolvedValue({ success: true, data: { id: "media-1" } });

    const { deleteMediaSafely } = await import("./delete-media-safely");
    const result = await deleteMediaSafely({ id: "media-1" });

    expect(result).toEqual({ success: true, data: { id: "media-1" } });
    expect(deleteMedia).toHaveBeenCalledWith({ id: "media-1" });
  });

  it("propagates the error when the cms reference check itself fails", async () => {
    const error = { code: "cms.entries.internal_error", message: "boom" };
    isMediaReferenced.mockResolvedValue({ success: false, error });

    const { deleteMediaSafely } = await import("./delete-media-safely");
    const result = await deleteMediaSafely({ id: "media-1" });

    expect(result).toEqual({ success: false, error });
    expect(deleteMedia).not.toHaveBeenCalled();
  });
});
