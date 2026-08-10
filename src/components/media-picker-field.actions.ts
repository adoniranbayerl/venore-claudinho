"use server";

import {
  confirmMediaUpload,
  listCategories,
  listMediaAssets,
  requestMediaUploadTicket,
  uploadMediaAsset,
  type RequestMediaUploadTicketResult,
} from "@/contexts/media";
import type { OperationResult } from "@/shared/types";

export type PickableMedia = { id: string; filename: string; url: string; contentType: string };
export type PickableCategory = { id: string; name: string };

function toPickableMedia(asset: { id: string; filename: string; url: string; contentType: string }): PickableMedia {
  return { id: asset.id, filename: asset.filename, url: asset.url, contentType: asset.contentType };
}

// Server action dedicada ao MediaPickerField: o componente é client (precisa reabrir a lista sob
// demanda ao abrir o modal), então não pode importar contexts/media direto — passa por aqui.
export async function listMediaForPickerAction(categoryId?: string): Promise<PickableMedia[]> {
  const result = await listMediaAssets(categoryId ? { categoryId } : {});
  if (!result.success) {
    return [];
  }

  return result.data.map(toPickableMedia);
}

export async function listCategoriesForPickerAction(): Promise<PickableCategory[]> {
  const result = await listCategories();
  return result.success ? result.data.map((category) => ({ id: category.id, name: category.name })) : [];
}

// Upload "no momento" a partir do próprio picker (pedido: quem está preenchendo um formulário de
// página — agenda/playlist do broadcast, capa de curso, entry de cms — não devia precisar
// interromper o fluxo, ir pra /admin/media, enviar lá, e voltar pra selecionar). Caminho
// server-buffered (mesmo de uploadMediaAction em admin/media/actions.ts) — só serve pra arquivo
// pequeno o bastante pra caber no body de uma server action; arquivo grande (vídeo, sobretudo)
// usa o fluxo de ticket abaixo. "public" fixo (sem seletor de visibilidade neste form compacto):
// mídia enviada por aqui é sempre conteúdo referenciado em alguma outra página (logo, capa,
// imagem de entry, vídeo de playlist), não arquivo privado como avatar/entrega de atividade — tem
// que renderizar pra quem visita a página que a referencia.
export async function uploadMediaForPickerAction(input: {
  filename: string;
  contentType: string;
  size: number;
  data: ArrayBuffer;
}): Promise<OperationResult<PickableMedia>> {
  const result = await uploadMediaAsset({
    filename: input.filename,
    contentType: input.contentType,
    size: input.size,
    data: Buffer.from(input.data),
    visibility: "public",
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: toPickableMedia(result.data) };
}

// Fluxo de upload direto ao Blob (docs/media/blob-spec.md) — necessário pra arquivo que excede o
// limite de body de uma server action (vídeo de playlist do broadcast, principalmente). As duas
// actions abaixo são passagem direta pro barrel de media (mesmo padrão de
// admin/media/upload-test/actions.ts), sem lógica própria.
export async function requestUploadTicketForPickerAction(input: {
  filename: string;
  contentType: string;
  size: number;
}): Promise<RequestMediaUploadTicketResult> {
  return requestMediaUploadTicket(input);
}

export async function confirmUploadForPickerAction(input: {
  filename: string;
  pathname: string;
  url: string;
  contentType: string;
  size: number;
  checksum: string;
}): Promise<OperationResult<PickableMedia>> {
  const result = await confirmMediaUpload(input);
  if (!result.success) {
    return result;
  }

  return { success: true, data: toPickableMedia(result.data) };
}
