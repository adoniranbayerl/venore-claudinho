import type {
  RemoteObjectSummary,
  StoragePort,
  StoragePutInput,
  StoredObject,
  UploadTicket,
  UploadTicketInput,
} from "./storage-port";

type StoredEntry = { data: Buffer; contentType: string; uploadedAt: Date };

// Testes unitários/integração — guarda um Map<key, Buffer> em memória, nunca toca disco/rede
// (blob-spec seção 2).
export class InMemoryStorageAdapter implements StoragePort {
  private readonly objects = new Map<string, StoredEntry>();

  async store(input: StoragePutInput): Promise<StoredObject> {
    this.objects.set(input.key, { data: input.data, contentType: input.contentType, uploadedAt: new Date() });
    return { key: input.key, url: this.resolveUrl(input.key), size: input.data.byteLength };
  }

  async remove(key: string): Promise<void> {
    this.objects.delete(key);
  }

  resolveUrl(key: string): string {
    return `memory://media/${key}`;
  }

  async createUploadTicket(input: UploadTicketInput): Promise<UploadTicket> {
    return {
      key: input.key,
      uploadUrl: `memory://media/upload/${input.key}`,
      token: `in-memory-token-${input.key}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async listObjects(prefix?: string): Promise<RemoteObjectSummary[]> {
    const entries: RemoteObjectSummary[] = [];
    for (const [key, entry] of this.objects) {
      if (prefix && !key.startsWith(prefix)) continue;
      entries.push({ key, size: entry.data.byteLength, uploadedAt: entry.uploadedAt });
    }
    return entries;
  }

  // Só para teste: permite simular um upload que já aconteceu direto no storage, sem passar
  // por `store` (que é o caminho server-buffered) — espelha o que o client-upload faz.
  seed(key: string, data: Buffer, contentType: string): void {
    this.objects.set(key, { data, contentType, uploadedAt: new Date() });
  }

  has(key: string): boolean {
    return this.objects.has(key);
  }
}
