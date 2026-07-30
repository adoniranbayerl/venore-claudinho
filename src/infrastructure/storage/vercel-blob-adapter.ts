import { del, list, put } from "@vercel/blob";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import type {
  RemoteObjectSummary,
  StoragePort,
  StoragePutInput,
  StoredObject,
  UploadTicket,
  UploadTicketInput,
} from "./storage-port";

const UPLOAD_TICKET_TTL_SECONDS = 60 * 30;

// Nenhum tipo de @vercel/blob escapa deste arquivo — o resto do domínio só conhece StoragePort
// (blob-spec seção 2).
export class VercelBlobAdapter implements StoragePort {
  async store(input: StoragePutInput): Promise<StoredObject> {
    const blob = await put(input.key, input.data, {
      access: "public",
      contentType: input.contentType,
      addRandomSuffix: false,
    });
    return { key: blob.pathname, url: blob.url, size: input.data.byteLength };
  }

  async remove(key: string): Promise<void> {
    await del(key);
  }

  resolveUrl(key: string): string {
    const storeId = process.env.BLOB_READ_WRITE_TOKEN?.split("_").at(-2);
    return storeId ? `https://${storeId}.public.blob.vercel-storage.com/${key}` : key;
  }

  async createUploadTicket(input: UploadTicketInput): Promise<UploadTicket> {
    const token = await generateClientTokenFromReadWriteToken({
      pathname: input.key,
      allowedContentTypes: [input.contentType],
      maximumSizeInBytes: input.maxSizeBytes,
      addRandomSuffix: false,
    });
    return {
      key: input.key,
      uploadUrl: "https://blob.vercel-storage.com",
      token,
      expiresAt: new Date(Date.now() + UPLOAD_TICKET_TTL_SECONDS * 1000),
    };
  }

  async listObjects(prefix?: string): Promise<RemoteObjectSummary[]> {
    const { blobs } = await list({ prefix });
    return blobs.map((blob) => ({ key: blob.pathname, size: blob.size, uploadedAt: blob.uploadedAt }));
  }
}
