"use server";

import { revalidatePath } from "next/cache";
import { updateEntryComposition, validateComposition, type Composition } from "@/contexts/cms";
import { resolveBlockDefinition } from "@/platform/page-builder/block-registry";
import { resolveErrorBlockId } from "@/platform/page-builder/composition-tree";

export type SaveCompositionResult =
  | { success: true }
  | { success: false; error: { code: string; message: string; blockId: string | null } };

// A validação roda aqui (fora do handler) só pra recuperar o `path` do erro — o handler devolve
// {code, message} (formato fixo de OperationResult), sem path; validateComposition roda de novo
// dentro dele, então isso é redundante mas barato, e é o único jeito de destacar o bloco culpado
// em vez de um toast genérico (pedido da sessão).
export async function saveEntryCompositionAction(entryId: string, composition: Composition): Promise<SaveCompositionResult> {
  const validation = validateComposition(composition, resolveBlockDefinition);
  if (!validation.valid) {
    const [first] = validation.errors;
    return {
      success: false,
      error: { code: first.code, message: first.message, blockId: resolveErrorBlockId(composition, first.path) },
    };
  }

  const result = await updateEntryComposition({ id: entryId, composition, resolveDefinition: resolveBlockDefinition });
  if (!result.success) {
    return { success: false, error: { ...result.error, blockId: null } };
  }

  revalidatePath("/admin/cms");
  revalidatePath(`/admin/cms/entries/${entryId}`);
  revalidatePath(`/admin/cms/entries/${entryId}/builder`);
  return { success: true };
}
