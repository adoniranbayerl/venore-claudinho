"use server";

import { revalidatePath } from "next/cache";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { addTrackingComment, rateTicket } from "@/plugins/helpdesk";

export type TrackActionState = { error: string | null; ok?: boolean };

const PLUGIN_DISABLED_ERROR = "O plugin Chamados está desabilitado.";

// Comentar pelo link de acompanhamento anônimo (§2.5). O trackingToken vai num input hidden — a
// action não tem sessão, é o próprio token que autoriza (o use case valida formato + throttle).
export async function submitTrackingCommentAction(
  _prev: TrackActionState,
  formData: FormData,
): Promise<TrackActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const trackingToken = String(formData.get("trackingToken") ?? "");
  const result = await addTrackingComment({ trackingToken, body: String(formData.get("body") ?? "") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(`/chamados/acompanhar/${trackingToken}`);
  return { error: null, ok: true };
}

// Avaliar o atendimento pelo link (§2.5). Nota 1..5 + observação opcional.
export async function rateTicketAction(_prev: TrackActionState, formData: FormData): Promise<TrackActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const trackingToken = String(formData.get("trackingToken") ?? "");
  const score = Number(formData.get("score"));
  const result = await rateTicket({
    trackingToken,
    score: Number.isFinite(score) ? score : 0,
    comment: String(formData.get("comment") ?? "").trim() || null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(`/chamados/acompanhar/${trackingToken}`);
  return { error: null, ok: true };
}
