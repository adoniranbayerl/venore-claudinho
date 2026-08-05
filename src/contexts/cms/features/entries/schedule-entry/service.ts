import { beginOperation, endOperation } from "@/observability";
import { findEntryById, markEntryScheduled } from "./store";
import type { ScheduleEntryCommand, ScheduleEntryResult } from "./types";

export async function scheduleEntry(command: ScheduleEntryCommand): Promise<ScheduleEntryResult> {
  const handle = beginOperation({
    useCase: "cms.schedule-entry",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findEntryById(command.id);
  if (!existing) {
    const error = { code: "cms.entries.not_found", message: `Entry "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  // Agendar publicação só faz sentido pra quem ainda não foi ao ar — uma entry já "published"
  // usa scheduledArchiveAt via update-entry (agendar só o arquivamento), não este use case, que
  // sempre força o status de volta pra "scheduled" (docs/implementation-roadmap.md, Fase 2/C5).
  if (existing.status === "published" || existing.status === "archived") {
    const error = {
      code: "cms.entries.cannot_schedule",
      message: `Entry "${command.id}" está "${existing.status}" — agendar publicação só é possível a partir de rascunho ou de outro agendamento.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const entry = await markEntryScheduled(command.id, {
    scheduledPublishAt: command.scheduledPublishAt,
    scheduledArchiveAt: command.scheduledArchiveAt ?? null,
  });

  endOperation(handle, { success: true });
  return { success: true, data: entry };
}
