import { MEDIA_ALLOWED_TYPES, type MediaAssetCategory } from "./contracts/types";

// Organização de pasta no blob por tipo de arquivo (pedido do usuário) — nunca por data: uma
// árvore de pastas por dia cresce sem fim e ninguém navega mídia "por dia enviado". Sem acento
// nos nomes de propósito, pra nunca depender de encoding de URL/key no storage.
const MEDIA_STORAGE_FOLDER_BY_CATEGORY: Record<MediaAssetCategory, string> = {
  document: "Documentos",
  image: "Imagens",
  video: "Videos",
  audio: "Audios",
};

// contentType sempre já validado contra MEDIA_ALLOWED_TYPES antes de qualquer chamador chegar
// aqui (validateMediaUploadCandidate, ou o gate de contentType do upload de avatar/atividade) —
// o fallback "document" só existiria se um chamador pulasse essa validação, o que seria bug de
// chamador, não caso normal a tratar aqui.
export function resolveMediaStorageFolder(contentType: string): string {
  const category = MEDIA_ALLOWED_TYPES[contentType]?.category ?? "document";
  return MEDIA_STORAGE_FOLDER_BY_CATEGORY[category];
}
