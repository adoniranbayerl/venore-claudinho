import { isMediaReferenced } from "@/contexts/cms";
import { deleteMedia } from "@/contexts/media";
import type { OperationResult } from "@/shared/types";

export type DeleteMediaSafelyInput = { id: string };

// Ponto de composição fora de cms e media (docs/venore-docks.md — regra 12): cms já depende de
// media (validação de mediaId em create-entry/update-entry); se media passasse a depender de cms
// pra checar uso antes de apagar, fecharia um ciclo (regra 11). Este wiring fica fora dos dois —
// use este arquivo pra apagar mídia, não contexts/media.deleteMedia direto (regra 14).
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

  return deleteMedia({ id: input.id });
}
