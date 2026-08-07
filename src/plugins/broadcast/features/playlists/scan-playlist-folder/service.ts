import { readdir } from "node:fs/promises";
import path from "node:path";
import { getSetting } from "@/contexts/settings";
import { beginOperation, endOperation } from "@/observability";
import { BROADCAST_SETTINGS } from "../../../shared/settings";
import { resolveWithinRoot, toStoredRelativePath } from "../../../shared/sandboxed-path";
import { isVideoExtension } from "../../../shared/video-extensions";
import {
  deletePlaylistItemsByIds,
  findLocalPlaylistItemsByPlaylistId,
  findMaxPlaylistItemOrder,
  findPlaylistById,
  insertLocalPlaylistItems,
} from "./store";
import type { ScanPlaylistFolderCommand, ScanPlaylistFolderResult } from "./types";

// Descobre só vídeo — imagem tem seu próprio fluxo dedicado (biblioteca de mídia, via
// AddMediaAssetItemForm), então a pasta varrida automaticamente não mistura os dois (feedback
// direto: "o botão reescanear pasta faz sentido apenas para adicionar vídeos"). Nunca segue
// symlink (entry.isSymbolicLink() é pulado) — um link dentro da pasta sandboxed apontando pra
// fora seria uma forma de escapar resolveWithinRoot depois do primeiro check.
async function listStreamableFilesRecursively(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;

    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listStreamableFilesRecursively(entryPath)));
      continue;
    }

    if (entry.isFile() && isVideoExtension(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

export async function scanPlaylistFolder(command: ScanPlaylistFolderCommand): Promise<ScanPlaylistFolderResult> {
  const playlist = await findPlaylistById(command.playlistId);
  if (!playlist) {
    return {
      success: false,
      error: { code: "broadcast.scan-playlist-folder.not_found", message: "Playlist não encontrada." },
    };
  }
  if (!playlist.folderPath) {
    return {
      success: false,
      error: {
        code: "broadcast.scan-playlist-folder.no_folder",
        message: "Esta playlist não tem uma pasta configurada.",
      },
    };
  }

  const rootSetting = await getSetting({ key: BROADCAST_SETTINGS.rootFolder.key });
  const rootFolder = rootSetting.success && typeof rootSetting.data?.value === "string" ? rootSetting.data.value : "";
  if (!rootFolder.trim()) {
    return {
      success: false,
      error: {
        code: "broadcast.scan-playlist-folder.root_not_configured",
        message: "A pasta raiz de vídeos (broadcast.rootFolder) ainda não foi configurada.",
      },
    };
  }

  const targetDir = resolveWithinRoot(rootFolder, playlist.folderPath);
  if (!targetDir) {
    return {
      success: false,
      error: {
        code: "broadcast.scan-playlist-folder.path_escape",
        message: "A pasta da playlist está fora da raiz configurada.",
      },
    };
  }

  let discoveredFiles: string[];
  try {
    discoveredFiles = await listStreamableFilesRecursively(targetDir);
  } catch {
    return {
      success: false,
      error: {
        code: "broadcast.scan-playlist-folder.folder_not_found",
        message: "Não foi possível ler a pasta configurada — confira se ela existe no servidor.",
      },
    };
  }

  const discoveredRelativePaths = new Set(discoveredFiles.map((filePath) => toStoredRelativePath(rootFolder, filePath)));

  const existingItems = await findLocalPlaylistItemsByPlaylistId(command.playlistId);
  const existingRelativePaths = new Set(existingItems.map((item) => item.relativePath));

  const toRemove = existingItems.filter((item) => !discoveredRelativePaths.has(item.relativePath as string));
  const toAdd = [...discoveredRelativePaths].filter((relativePath) => !existingRelativePaths.has(relativePath));

  const handle = beginOperation({
    useCase: "broadcast.scan-playlist-folder",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  if (toRemove.length > 0) {
    await deletePlaylistItemsByIds(toRemove.map((item) => item.id));
  }

  if (toAdd.length > 0) {
    let nextOrder = (await findMaxPlaylistItemOrder(command.playlistId)) + 1;
    await insertLocalPlaylistItems(
      toAdd.map((relativePath) => ({
        playlistId: command.playlistId,
        order: nextOrder++,
        title: null,
        relativePath,
      })),
    );
  }

  endOperation(handle, { success: true });
  return { success: true, data: { added: toAdd.length, removed: toRemove.length } };
}
