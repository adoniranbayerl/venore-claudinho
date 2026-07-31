"use server";

import { revalidatePath } from "next/cache";
import {
  clearDiagnosticsEventsSafely,
  getDiagnosticsEventsClearCountSafely,
} from "@/platform/diagnostics-lifecycle/clear-diagnostics-events-safely";

export type ClearEventsActionState = { error: string | null };

// Consultada pelo client antes de pedir confirmação ("N registros serão removidos") — leitura
// pura, mesmo padrão de getMediaUsageSummaryAction (admin/media/actions.ts).
export async function getEventsClearSummaryAction(): Promise<number> {
  const result = await getDiagnosticsEventsClearCountSafely();
  return result.success ? result.data.count : 0;
}

// Mesmo padrão de deleteMediaAction (admin/media/actions.ts): primeiro submit sem `confirmed`
// devolve a contagem via mensagem de erro (confirmation_required), a UI usa isso pra montar o
// confirm() e reenviar com confirmed=true.
export async function clearEventsAction(
  _prevState: ClearEventsActionState,
  formData: FormData,
): Promise<ClearEventsActionState> {
  const confirmed = formData.get("confirmed") === "true";
  const result = await clearDiagnosticsEventsSafely(confirmed);

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/diagnostics");
  return { error: null };
}
