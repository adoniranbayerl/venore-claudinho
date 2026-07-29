import { isMediaReferenced } from "@/contexts/cms";
import { deleteMedia } from "@/contexts/media";
import type { OperationResult } from "@/shared/types";
import { isMediaReferencedByBrand } from "@/platform/brand/is-media-referenced-by-brand";

export type DeleteMediaSafelyInput = { id: string };

// Ponto de composição fora de cms e media (docs/venore-docks.md — regra 12): cms já depende de
// media (validação de mediaId em create-entry/update-entry); se media passasse a depender de cms
// pra checar uso antes de apagar, fecharia um ciclo (regra 11). Este wiring fica fora dos dois —
// use este arquivo pra apagar mídia, não contexts/media.deleteMedia direto (regra 14). Mesmo
// motivo pra brand: settings guarda mediaId de logo/favicon, não pode depender de media pra
// checar uso sem fechar outro ciclo.
export async function deleteMediaSafely(input: DeleteMediaSafelyInput): Promise<OperationResult<{ id: string }>> {
  const referenced = await isMediaReferenced({ mediaId: input.id });
  if (!referenced.success) {
    return referenced;
  }

  if (referenced.data) {
    return {
      success: false,
      error: {
        code: "media.delete.in_use",
        message: `O arquivo "${input.id}" está em uso por uma ou mais entries do CMS e não pode ser apagado.`,
      },
    };
  }

  const referencedByBrand = await isMediaReferencedByBrand({ mediaId: input.id });
  if (!referencedByBrand.success) {
    return referencedByBrand;
  }

  if (referencedByBrand.data) {
    return {
      success: false,
      error: {
        code: "media.delete.in_use",
        message: `O arquivo "${input.id}" está em uso pelas configurações de marca (logo ou favicon) e não pode ser apagado.`,
      },
    };
  }

  return deleteMedia({ id: input.id });
}
