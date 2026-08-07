import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({
    operationId: "op-1",
    useCase: "test",
    actor: { id: "actor-1", type: "user" },
    kind: "write",
    startedAt: new Date(),
  })),
  endOperation: vi.fn(),
}));

const getSetting = vi.fn();
vi.mock("@/contexts/settings", () => ({
  getSetting: (...args: unknown[]) => getSetting(...args),
}));

const readdir = vi.fn();
vi.mock("node:fs/promises", () => ({
  readdir: (...args: unknown[]) => readdir(...args),
}));

const findPlaylistById = vi.fn();
const findLocalPlaylistItemsByPlaylistId = vi.fn();
const findMaxPlaylistItemOrder = vi.fn();
const insertLocalPlaylistItems = vi.fn();
const deletePlaylistItemsByIds = vi.fn();
vi.mock("./store", () => ({
  findPlaylistById: (...args: unknown[]) => findPlaylistById(...args),
  findLocalPlaylistItemsByPlaylistId: (...args: unknown[]) => findLocalPlaylistItemsByPlaylistId(...args),
  findMaxPlaylistItemOrder: (...args: unknown[]) => findMaxPlaylistItemOrder(...args),
  insertLocalPlaylistItems: (...args: unknown[]) => insertLocalPlaylistItems(...args),
  deletePlaylistItemsByIds: (...args: unknown[]) => deletePlaylistItemsByIds(...args),
}));

const ROOT = path.join("C:", "media", "broadcast");

function fileEntry(name: string) {
  return { name, isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false };
}
function dirEntry(name: string) {
  return { name, isFile: () => false, isDirectory: () => true, isSymbolicLink: () => false };
}

describe("scanPlaylistFolder", () => {
  beforeEach(() => {
    getSetting.mockReset();
    readdir.mockReset();
    findPlaylistById.mockReset();
    findLocalPlaylistItemsByPlaylistId.mockReset();
    findMaxPlaylistItemOrder.mockReset();
    insertLocalPlaylistItems.mockReset();
    deletePlaylistItemsByIds.mockReset();
    getSetting.mockResolvedValue({ success: true, data: { key: "broadcast.rootFolder", value: ROOT, updatedAt: new Date() } });
  });

  it("fails when the playlist does not exist", async () => {
    findPlaylistById.mockResolvedValue(null);

    const { scanPlaylistFolder } = await import("./service");
    const result = await scanPlaylistFolder({ playlistId: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "broadcast.scan-playlist-folder.not_found", message: expect.any(String) },
    });
  });

  it("fails when the playlist has no folder configured", async () => {
    findPlaylistById.mockResolvedValue({ id: "p1", name: "Clips", folderPath: null });

    const { scanPlaylistFolder } = await import("./service");
    const result = await scanPlaylistFolder({ playlistId: "p1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.scan-playlist-folder.no_folder");
  });

  it("fails when broadcast.rootFolder is not configured", async () => {
    findPlaylistById.mockResolvedValue({ id: "p1", name: "Clips", folderPath: "clips" });
    getSetting.mockResolvedValue({ success: true, data: null });

    const { scanPlaylistFolder } = await import("./service");
    const result = await scanPlaylistFolder({ playlistId: "p1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.scan-playlist-folder.root_not_configured");
  });

  it("fails when the playlist folder escapes the configured root", async () => {
    findPlaylistById.mockResolvedValue({ id: "p1", name: "Clips", folderPath: "../../outside" });

    const { scanPlaylistFolder } = await import("./service");
    const result = await scanPlaylistFolder({ playlistId: "p1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.scan-playlist-folder.path_escape");
    expect(readdir).not.toHaveBeenCalled();
  });

  it("adds newly discovered video files and removes items no longer on disk", async () => {
    findPlaylistById.mockResolvedValue({ id: "p1", name: "Clips", folderPath: "clips" });
    findLocalPlaylistItemsByPlaylistId.mockResolvedValue([
      { id: "item-kept", relativePath: "clips/intro.mp4" },
      { id: "item-stale", relativePath: "clips/removed.mp4" },
    ]);
    findMaxPlaylistItemOrder.mockResolvedValue(0);

    const clipsDir = path.join(ROOT, "clips");
    const subDir = path.join(clipsDir, "sub");
    readdir.mockImplementation(async (dir: string) => {
      if (dir === clipsDir) return [fileEntry("intro.mp4"), fileEntry("notes.txt"), dirEntry("sub")];
      if (dir === subDir) return [fileEntry("clip2.webm")];
      throw new Error(`unexpected readdir(${dir})`);
    });

    const { scanPlaylistFolder } = await import("./service");
    const result = await scanPlaylistFolder({ playlistId: "p1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { added: 1, removed: 1 } });
    expect(deletePlaylistItemsByIds).toHaveBeenCalledWith(["item-stale"]);
    expect(insertLocalPlaylistItems).toHaveBeenCalledWith([
      { playlistId: "p1", order: 1, title: null, relativePath: "clips/sub/clip2.webm" },
    ]);
  });

  it("ignores image files — imagem entra só pela biblioteca de mídia, não pelo scan de pasta", async () => {
    findPlaylistById.mockResolvedValue({ id: "p1", name: "Clips", folderPath: "clips" });
    findLocalPlaylistItemsByPlaylistId.mockResolvedValue([]);
    findMaxPlaylistItemOrder.mockResolvedValue(-1);

    const clipsDir = path.join(ROOT, "clips");
    readdir.mockImplementation(async (dir: string) => {
      if (dir === clipsDir) return [fileEntry("intro.mp4"), fileEntry("banner.png"), fileEntry("photo.jpg")];
      throw new Error(`unexpected readdir(${dir})`);
    });

    const { scanPlaylistFolder } = await import("./service");
    const result = await scanPlaylistFolder({ playlistId: "p1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { added: 1, removed: 0 } });
    expect(insertLocalPlaylistItems).toHaveBeenCalledWith([
      { playlistId: "p1", order: 0, title: null, relativePath: "clips/intro.mp4" },
    ]);
  });

  it("surfaces a clear error when the configured folder can't be read from disk", async () => {
    findPlaylistById.mockResolvedValue({ id: "p1", name: "Clips", folderPath: "clips" });
    readdir.mockRejectedValue(new Error("ENOENT"));

    const { scanPlaylistFolder } = await import("./service");
    const result = await scanPlaylistFolder({ playlistId: "p1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.scan-playlist-folder.folder_not_found");
  });
});
