import { InMemoryStorageAdapter } from "./in-memory-storage-adapter";
import { LocalStorageAdapter } from "./local-storage-adapter";
import type { StorageAdapter } from "./storage-adapter";
import type { StoragePort } from "./storage-port";
import { VercelBlobAdapter } from "./vercel-blob-adapter";

function createStorageAdapter(): StorageAdapter {
  const driver = process.env.MEDIA_STORAGE_DRIVER ?? "local";

  switch (driver) {
    case "local":
      return new LocalStorageAdapter();
    default:
      throw new Error(`Driver de storage desconhecido: "${driver}".`);
  }
}

// Fluxo novo de client-upload (blob-spec seção 2/9). Mesmo MEDIA_STORAGE_DRIVER do
// StorageAdapter legado: "vercel-blob" usa o Blob Store real; qualquer outro valor (default
// "local") cai no adapter em memória — não existe ainda uma implementação de StoragePort para
// disco local (fora do escopo desta sessão), diferente do StorageAdapter legado.
function createStoragePort(): StoragePort {
  const driver = process.env.MEDIA_STORAGE_DRIVER ?? "local";

  switch (driver) {
    case "vercel-blob":
      return new VercelBlobAdapter();
    case "local":
      return new InMemoryStorageAdapter();
    default:
      throw new Error(`Driver de storage desconhecido: "${driver}".`);
  }
}

export const storageAdapter: StorageAdapter = createStorageAdapter();
export const storagePort: StoragePort = createStoragePort();

export type { StorageAdapter } from "./storage-adapter";
export type {
  RemoteObjectSummary,
  StoragePort,
  StoragePutInput,
  StoredObject,
  UploadTicket,
  UploadTicketInput,
} from "./storage-port";
