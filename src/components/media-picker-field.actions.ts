"use server";

import { listMedia } from "@/contexts/media";

export type PickableMedia = { id: string; filename: string; url: string; mimeType: string };

// Server action dedicada ao MediaPickerField: o componente é client (precisa reabrir a lista sob
// demanda ao abrir o modal), então não pode importar contexts/media direto — passa por aqui.
export async function listMediaForPickerAction(): Promise<PickableMedia[]> {
  const result = await listMedia();
  if (!result.success) {
    return [];
  }

  return result.data.map((file) => ({
    id: file.id,
    filename: file.filename,
    url: file.url,
    mimeType: file.mimeType,
  }));
}
