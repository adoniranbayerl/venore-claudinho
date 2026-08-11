import { beginOperation, endOperation } from "@/observability";
import { applyAgendaEventUpdate, findAgendaEventById } from "./store";
import type { UpdateAgendaEventCommand, UpdateAgendaEventResult } from "./types";

export async function updateAgendaEvent(command: UpdateAgendaEventCommand): Promise<UpdateAgendaEventResult> {
  const handle = beginOperation({
    useCase: "broadcast.update-agenda-event",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findAgendaEventById(command.eventId);
  if (!existing) {
    const error = { code: "broadcast.update-agenda-event.not_found", message: "Evento não encontrado." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const record = await applyAgendaEventUpdate({
    id: command.eventId,
    title: command.title.trim(),
    description: command.description?.trim() || null,
    startAt: command.startAt,
    recurring: command.recurring ?? false,
    endTime: command.endTime?.trim() || null,
    coverMediaAssetId: command.coverMediaAssetId?.trim() || null,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
