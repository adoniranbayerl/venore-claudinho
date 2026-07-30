import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "read", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

describe("validateMediaUploadCandidate", () => {
  it("rejects a contentType that is not in the allowlist", async () => {
    const { validateMediaUploadCandidate } = await import("./service");
    const result = validateMediaUploadCandidate({ contentType: "image/svg+xml", size: 1024 });
    expect(result).toEqual({ success: false, error: { code: "media.upload.unsupported_type", message: expect.any(String) } });
  });

  it("rejects size <= 0", async () => {
    const { validateMediaUploadCandidate } = await import("./service");
    const result = validateMediaUploadCandidate({ contentType: "image/png", size: 0 });
    expect(result).toEqual({ success: false, error: { code: "media.upload.invalid_size", message: expect.any(String) } });
  });

  it("accepts a size exactly at the category limit (boundary)", async () => {
    const { validateMediaUploadCandidate } = await import("./service");
    const maxSizeBytes = 8 * 1024 * 1024;
    const result = validateMediaUploadCandidate({ contentType: "image/png", size: maxSizeBytes });
    expect(result).toEqual({ success: true, data: { maxSizeBytes } });
  });

  it("rejects a size one byte over the category limit (boundary)", async () => {
    const { validateMediaUploadCandidate } = await import("./service");
    const maxSizeBytes = 8 * 1024 * 1024;
    const result = validateMediaUploadCandidate({ contentType: "image/png", size: maxSizeBytes + 1 });
    expect(result).toEqual({ success: false, error: { code: "media.upload.file_too_large", message: expect.any(String) } });
  });
});

describe("requestMediaUploadTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails validation before generating a pathname", async () => {
    const { requestMediaUploadTicket } = await import("./service");
    const result = await requestMediaUploadTicket({ filename: "malware.svg", contentType: "image/svg+xml", size: 10, actorId: "actor-1" });
    expect(result.success).toBe(false);
  });

  it("sanitizes the filename and prefixes it with a random uuid", async () => {
    const { requestMediaUploadTicket } = await import("./service");
    const result = await requestMediaUploadTicket({ filename: "my photo (final)!.png", contentType: "image/png", size: 1024, actorId: "actor-1" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pathname).toMatch(/^[0-9a-f-]{36}-my_photo__final__\.png$/);
    expect(result.data.contentType).toBe("image/png");
  });
});
