export interface StorageAdapter {
  put(input: { key: string; data: Buffer; mimeType: string }): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
}
