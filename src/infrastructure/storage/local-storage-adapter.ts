import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./storage-adapter";

const STORAGE_DIR = process.env.MEDIA_LOCAL_STORAGE_DIR ?? path.join("public", "uploads", "media");
const PUBLIC_PATH = process.env.MEDIA_LOCAL_PUBLIC_PATH ?? "/uploads/media";

export class LocalStorageAdapter implements StorageAdapter {
  async put(input: { key: string; data: Buffer; mimeType: string }): Promise<{ url: string }> {
    await mkdir(STORAGE_DIR, { recursive: true });
    await writeFile(path.join(STORAGE_DIR, input.key), input.data);
    return { url: `${PUBLIC_PATH}/${input.key}` };
  }

  async delete(key: string): Promise<void> {
    await unlink(path.join(STORAGE_DIR, key));
  }
}
