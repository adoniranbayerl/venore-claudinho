import { describe, expect, it } from "vitest";
import { resolveMediaStorageFolder } from "./resolve-media-storage-folder";

describe("resolveMediaStorageFolder", () => {
  it.each([
    ["image/png", "Imagens"],
    ["image/jpeg", "Imagens"],
    ["application/pdf", "Documentos"],
    ["video/mp4", "Videos"],
    ["audio/mpeg", "Audios"],
  ])("maps %s to %s", (contentType, folder) => {
    expect(resolveMediaStorageFolder(contentType)).toBe(folder);
  });

  it("falls back to Documentos for a contentType outside the allowlist", () => {
    expect(resolveMediaStorageFolder("application/x-unknown")).toBe("Documentos");
  });
});
