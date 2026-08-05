import { purgeMediaAsset } from "@/contexts/media";
import type { OperationResult } from "@/shared/types";
import { collectMediaUsage } from "@/platform/media-usage/media-usage-registry";

export type PurgeMediaSafelyInput = { id: string };

// Mesmo raciocínio de delete-media-safely.ts (ponto de composição fora de cms/brand/academy e
// media, regra 12/14) — mas sem o bypass "confirmed": purgeMediaAsset é irreversível de verdade
// (apaga o blob), então uma referência ainda ativa sempre recusa, sem opção de forçar por aqui.
// Um asset soft-deletado voltar a estar referenciado não deveria acontecer (a UI exclui
// soft-deletados dos pickers) — se acontecer, é sinal de bug em outro lugar (blob-spec seção 7),
// e essa recusa é o que expõe o sinal em vez de escondê-lo apagando mesmo assim.
export async function purgeMediaSafely(input: PurgeMediaSafelyInput): Promise<OperationResult<{ id: string }>> {
  const usage = await collectMediaUsage(input.id);

  if (usage.length > 0) {
    const places = usage.map((reference) => reference.label).join(", ");
    return {
      success: false,
      error: {
        code: "media.purge.in_use",
        message: `Este arquivo ainda está referenciado em ${usage.length} local${usage.length === 1 ? "" : "is"} (${places}) — remova as referências antes de apagar definitivamente.`,
      },
    };
  }

  return purgeMediaAsset({ id: input.id });
}
