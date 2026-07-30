import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const uploadMedia = vi.fn();
vi.mock("./service", () => ({
  uploadMedia: (...args: unknown[]) => uploadMedia(...args),
}));

describe("uploadMediaHandler — visibilidade nasce privada por omissão", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    uploadMedia.mockReset();
    uploadMedia.mockResolvedValue({ success: true, data: { id: "media-1" } });
  });

  it("uploads as private when no visibility is given (avatar-style upload)", async () => {
    const { uploadMediaHandler } = await import("./handler");
    await uploadMediaHandler({ filename: "selfie.png", mimeType: "image/png", size: 10 } as never);

    expect(uploadMedia).toHaveBeenCalledWith(expect.objectContaining({ visibility: "private" }));
  });

  it("does not trust an arbitrary visibility value, defaulting anything but 'public' to private", async () => {
    const { uploadMediaHandler } = await import("./handler");
    await uploadMediaHandler({ filename: "selfie.png", mimeType: "image/png", size: 10, visibility: "whatever" } as never);

    expect(uploadMedia).toHaveBeenCalledWith(expect.objectContaining({ visibility: "private" }));
  });

  it("uploads as public only when explicitly requested", async () => {
    const { uploadMediaHandler } = await import("./handler");
    await uploadMediaHandler({ filename: "logo.png", mimeType: "image/png", size: 10, visibility: "public" } as never);

    expect(uploadMedia).toHaveBeenCalledWith(expect.objectContaining({ visibility: "public" }));
  });
});
