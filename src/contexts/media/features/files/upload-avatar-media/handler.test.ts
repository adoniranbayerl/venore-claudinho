import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
vi.mock("@/contexts/auth", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
}));

const uploadAvatarMedia = vi.fn();
vi.mock("./service", () => ({
  uploadAvatarMedia: (...args: unknown[]) => uploadAvatarMedia(...args),
}));

const baseInput = { filename: "selfie.png", mimeType: "image/png", size: 1024, data: Buffer.from("x") };

describe("uploadAvatarMediaHandler", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    getCurrentUser.mockResolvedValue({ success: true, data: { id: "actor-1" } });
    uploadAvatarMedia.mockReset();
    uploadAvatarMedia.mockResolvedValue({ success: true, data: { id: "media-1" } });
  });

  it("uploads for any authenticated actor, no media.manage required", async () => {
    const { uploadAvatarMediaHandler } = await import("./handler");
    const result = await uploadAvatarMediaHandler(baseInput);

    expect(result.success).toBe(true);
    expect(uploadAvatarMedia).toHaveBeenCalledWith(expect.objectContaining({ actorId: "actor-1" }));
  });

  it("rejects an unauthenticated actor without calling the service", async () => {
    getCurrentUser.mockResolvedValue({ success: true, data: null });

    const { uploadAvatarMediaHandler } = await import("./handler");
    const result = await uploadAvatarMediaHandler(baseInput);

    expect(result).toEqual({
      success: false,
      error: { code: "media.avatar.unauthenticated", message: expect.any(String) },
    });
    expect(uploadAvatarMedia).not.toHaveBeenCalled();
  });

  it("rejects a file at or above 500KB", async () => {
    const { uploadAvatarMediaHandler } = await import("./handler");
    const result = await uploadAvatarMediaHandler({ ...baseInput, size: 500 * 1024 + 1 });

    expect(result).toEqual({
      success: false,
      error: { code: "media.avatar.file_too_large", message: expect.any(String) },
    });
    expect(uploadAvatarMedia).not.toHaveBeenCalled();
  });

  it("accepts a file right at the 500KB boundary", async () => {
    const { uploadAvatarMediaHandler } = await import("./handler");
    const result = await uploadAvatarMediaHandler({ ...baseInput, size: 500 * 1024 });

    expect(result.success).toBe(true);
  });

  it("rejects a non-image mime type (e.g. pdf) even if it's on the general media allowlist", async () => {
    const { uploadAvatarMediaHandler } = await import("./handler");
    const result = await uploadAvatarMediaHandler({ ...baseInput, mimeType: "application/pdf" });

    expect(result).toEqual({
      success: false,
      error: { code: "media.avatar.invalid_mime_type", message: expect.any(String) },
    });
    expect(uploadAvatarMedia).not.toHaveBeenCalled();
  });

  it("rejects a mime type outside the allowlist entirely", async () => {
    const { uploadAvatarMediaHandler } = await import("./handler");
    const result = await uploadAvatarMediaHandler({ ...baseInput, mimeType: "image/svg+xml" });

    expect(result.success).toBe(false);
    expect(uploadAvatarMedia).not.toHaveBeenCalled();
  });
});
