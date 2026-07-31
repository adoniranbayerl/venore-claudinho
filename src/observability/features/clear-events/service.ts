import { recordAuditEvent } from "../../audit-log";
import { countAllEvents, deleteAllEvents } from "./store";
import type { ClearEventsCommand, ClearEventsResult } from "./types";

// Mesmo padrão de deleteMediaSafely (platform/media-lifecycle/delete-media-safely.ts): primeira
// chamada sem `confirmed` nunca apaga — devolve a contagem pra quem chamou montar o diálogo de
// confirmação. A limpeza em si gera um evento de auditoria (recordAuditEvent, tabela
// security_audit_events) depois de apagar os eventos operacionais — esse evento nunca é afetado
// pela própria limpeza, porque vive em tabela separada sem expurgo (decisão da FASE 1).
export async function clearEvents(command: ClearEventsCommand): Promise<ClearEventsResult> {
  const total = await countAllEvents();

  if (!command.confirmed) {
    return {
      success: false,
      error: {
        code: "observability.events.clear.confirmation_required",
        message: `${total} registro${total === 1 ? "" : "s"} de log operacional ${total === 1 ? "será removido" : "serão removidos"}. Confirme para prosseguir.`,
      },
    };
  }

  const cleared = await deleteAllEvents();

  await recordAuditEvent({
    action: "observability.events.clear",
    actor: command.actor,
    outcome: "success",
    summary: `${command.actor.type}:${command.actor.id} limpou ${cleared} evento${cleared === 1 ? "" : "s"} do log operacional de diagnóstico.`,
    detail: { cleared },
  });

  return { success: true, data: { cleared } };
}
