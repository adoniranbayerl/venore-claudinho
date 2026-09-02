import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FilesystemStorageAdapter, readFilesystemObjectContentType } from "./filesystem-storage-adapter";

describe("FilesystemStorageAdapter", () => {
  let root: string;
  const originalRoot = process.env.MEDIA_FILESYSTEM_ROOT;
  const originalPublicBase = process.env.MEDIA_FILESYSTEM_PUBLIC_URL;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "venore-fs-storage-"));
    process.env.MEDIA_FILESYSTEM_ROOT = root;
    delete process.env.MEDIA_FILESYSTEM_PUBLIC_URL;
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
    if (originalRoot === undefined) delete process.env.MEDIA_FILESYSTEM_ROOT;
    else process.env.MEDIA_FILESYSTEM_ROOT = originalRoot;
    if (originalPublicBase === undefined) delete process.env.MEDIA_FILESYSTEM_PUBLIC_URL;
    else process.env.MEDIA_FILESYSTEM_PUBLIC_URL = originalPublicBase;
  });

  it("stores bytes on disk, writes the contentType sidecar, and returns the serve-route URL", async () => {
    const adapter = new FilesystemStorageAdapter();
    const stored = await adapter.store({
      key: "Imagens/abc-123-foto.png",
      data: Buffer.from("hello-png"),
      contentType: "image/png",
    });

    expect(stored).toEqual({ key: "Imagens/abc-123-foto.png", url: "/api/media/file/Imagens/abc-123-foto.png", size: 9 });
    await expect(readFile(path.join(root, "Imagens/abc-123-foto.png"), "utf8")).resolves.toBe("hello-png");
    await expect(readFilesystemObjectContentType("Imagens/abc-123-foto.png")).resolves.toBe("image/png");
  });

  it("resolveUrl encodes path segments and honors MEDIA_FILESYSTEM_PUBLIC_URL", async () => {
    const adapter = new FilesystemStorageAdapter();
    expect(adapter.resolveUrl("Imagens/uuid nome.png")).toBe("/api/media/file/Imagens/uuid%20nome.png");

    process.env.MEDIA_FILESYSTEM_PUBLIC_URL = "http://media.lan:9000/files/";
    const withBase = new FilesystemStorageAdapter();
    expect(withBase.resolveUrl("Imagens/x.png")).toBe("http://media.lan:9000/files/Imagens/x.png");
  });

  it("rejects a key that escapes the root", async () => {
    const adapter = new FilesystemStorageAdapter();
    await expect(
      adapter.store({ key: "../../etc/passwd", data: Buffer.from("x"), contentType: "text/plain" }),
    ).rejects.toThrow(/fora da raiz/);
  });

  it("remove deletes the object and its sidecar, and is idempotent", async () => {
    const adapter = new FilesystemStorageAdapter();
    await adapter.store({ key: "Documentos/d.pdf", data: Buffer.from("pdf"), contentType: "application/pdf" });

    await adapter.remove("Documentos/d.pdf");
    await expect(readFile(path.join(root, "Documentos/d.pdf"))).rejects.toThrow();
    await expect(readFilesystemObjectContentType("Documentos/d.pdf")).resolves.toBeNull();

    await expect(adapter.remove("Documentos/d.pdf")).resolves.toBeUndefined();
  });

  it("listObjects walks the tree, skips sidecars, and filters by prefix", async () => {
    const adapter = new FilesystemStorageAdapter();
    await adapter.store({ key: "Imagens/a.png", data: Buffer.from("a"), contentType: "image/png" });
    await adapter.store({ key: "Imagens/b.png", data: Buffer.from("bb"), contentType: "image/png" });
    await adapter.store({ key: "Documentos/c.pdf", data: Buffer.from("ccc"), contentType: "application/pdf" });

    const all = await adapter.listObjects();
    expect(all.map((o) => o.key).sort()).toEqual(["Documentos/c.pdf", "Imagens/a.png", "Imagens/b.png"]);
    expect(all.every((o) => !o.key.endsWith(".meta.json"))).toBe(true);

    const imagesOnly = await adapter.listObjects("Imagens/");
    expect(imagesOnly.map((o) => o.key).sort()).toEqual(["Imagens/a.png", "Imagens/b.png"]);
  });

  it("createUploadTicket throws — direct browser upload is not supported on this driver", async () => {
    const adapter = new FilesystemStorageAdapter();
    await expect(adapter.createUploadTicket()).rejects.toThrow(/não suporta upload direto/);
  });
});
