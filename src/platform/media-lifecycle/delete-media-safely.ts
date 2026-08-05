import { deleteMediaAsset } from "@/contexts/media";
import type { OperationResult } from "@/shared/types";
import { collectMediaUsage } from "@/platform/media-usage/media-usage-registry";

export type DeleteMediaSafelyInput = { id: string; confirmed?: boolean };

// Ponto de composição fora de cms/brand/academy e media (docs/venore-docks.md — regra 12): cms já
// depende de media (validação de mediaId em create-entry/update-entry); se media passasse a
// depender de cms pra checar uso antes de apagar, fecharia um ciclo (regra 11). Este wiring fica
// fora de todos — use este arquivo pra apagar mídia, não contexts/media.deleteMedia direto
// (regra 14). O "quem usa" em si vem de platform/media-usage/media-usage-registry.ts, que
// substituiu as checagens ad hoc por consumidor que existiam aqui antes.
//
// Comportamento de aviso + confirmação (docs do pedido — "a deleção avisa quantos locais serão
// afetados e exige confirmação"): a primeira chamada, sem `confirmed`, nunca apaga se houver uso
// — devolve a contagem/lista pra quem chamou decidir. A UI usa isso pra montar o diálogo de
// confirmação (ver getMediaUsageSummaryAction em app/(platform)/admin/media/actions.ts); depois
// que o usuário confirma, o segundo submit chega aqui com `confirmed: true` e a exclusão
// prossegue mesmo com uso. Isso substitui o bloqueio incondicional que existia antes — decisão de
// produto desta sessão, não um relaxamento acidental da regra anterior.
export async function deleteMediaSafely(input: DeleteMediaSafelyInput): Promise<OperationResult<{ id: string }>> {
  const usage = await collectMediaUsage(input.id);

  if (usage.length > 0 && !input.confirmed) {
    const places = usage.map((reference) => reference.label).join(", ");
    return {
      success: false,
      error: {
        code: "media.delete.confirmation_required",
        message: `Este arquivo está em uso em ${usage.length} local${usage.length === 1 ? "" : "is"} (${places}). Confirme a exclusão para apagar mesmo assim.`,
      },
    };
  }

  return deleteMediaAsset({ id: input.id });
}
