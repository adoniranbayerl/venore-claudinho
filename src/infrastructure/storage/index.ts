import { LocalStorageAdapter } from "./local-storage-adapter";
import type { StorageAdapter } from "./storage-adapter";

function createStorageAdapter(): StorageAdapter {
  const driver = process.env.MEDIA_STORAGE_DRIVER ?? "local";

  switch (driver) {
    case "local":
      return new LocalStorageAdapter();
    default:
      throw new Error(`Driver de storage desconhecido: "${driver}".`);
  }
}

export const storageAdapter: StorageAdapter = createStorageAdapter();
export type { StorageAdapter } from "./storage-adapter";
