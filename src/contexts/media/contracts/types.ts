export type MediaVisibility = "private" | "public";

export type MediaRecord = {
  id: string;
  filename: string;
  storageKey: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  visibility: MediaVisibility;
  createdAt: Date;
};

// Fluxo novo de client-upload direto ao Blob (docs/media/blob-spec.md, seções 3/4).
export type MediaAsset = {
  id: string;
  pathname: string;
  url: string;
  contentType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  checksum: string;
  uploadedBy: string;
  visibility: MediaVisibility;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MediaAssetCategory = "image" | "document" | "video";

export type MediaAllowedTypeRule = {
  category: MediaAssetCategory;
  maxSizeBytes: number;
};

// Allowlist (nunca blocklist) — spec seção 5. `image/svg+xml` fica de fora deliberadamente
// (risco de XSS via script embutido).
export const MEDIA_ALLOWED_TYPES: Record<string, MediaAllowedTypeRule> = {
  "image/png": { category: "image", maxSizeBytes: 8 * 1024 * 1024 },
  "image/jpeg": { category: "image", maxSizeBytes: 8 * 1024 * 1024 },
  "image/webp": { category: "image", maxSizeBytes: 8 * 1024 * 1024 },
  "image/gif": { category: "image", maxSizeBytes: 8 * 1024 * 1024 },
  "application/pdf": { category: "document", maxSizeBytes: 20 * 1024 * 1024 },
  "video/mp4": { category: "video", maxSizeBytes: 200 * 1024 * 1024 },
  "video/webm": { category: "video", maxSizeBytes: 200 * 1024 * 1024 },
};

// Limite próprio do upload de avatar (upload-avatar-media) — bem mais restrito que o teto geral
// de imagem em MEDIA_ALLOWED_TYPES (8 MiB), porque avatar é servido em toda a UI a cada render.
export const AVATAR_MAX_SIZE_BYTES = 500 * 1024;
