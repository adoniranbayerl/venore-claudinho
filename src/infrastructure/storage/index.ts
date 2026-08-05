import { InMemoryStorageAdapter } from "./in-memory-storage-adapter";
import type { StoragePort } from "./storage-port";
import { VercelBlobAdapter } from "./vercel-blob-adapter";

// Único storage do projeto (docs/implementation-roadmap.md, Fase 4/M1-M3) — o adapter legado de
// disco local (`StorageAdapter`/`LocalStorageAdapter`, usado por `media.files`) foi descontinuado:
// só funcionava em dev, produção sempre precisou de um storage real. "vercel-blob" usa o Blob
// Store de verdade; qualquer outro valor (default "local") cai no adapter em memória — sem
// persistência entre processos, mas suficiente pra dev/teste sem token configurado.
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

export const storagePort: StoragePort = createStoragePort();

export type {
  RemoteObjectSummary,
  StoragePort,
  StoragePutInput,
  StoredObject,
  UploadTicket,
  UploadTicketInput,
} from "./storage-port";
