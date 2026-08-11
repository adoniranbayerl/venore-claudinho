import { beginOperation, endOperation } from "@/observability";
import { insertAgendaEvent } from "./store";
import type { CreateAgendaEventCommand, CreateAgendaEventResult } from "./types";

export async function createAgendaEvent(command: CreateAgendaEventCommand): Promise<CreateAgendaEventResult> {
  const handle = beginOperation({
    useCase: "broadcast.create-agenda-event",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await insertAgendaEvent({
    agendaId: command.agendaId,
    title: command.title.trim(),
    description: command.description?.trim() || null,
    startAt: command.startAt,
    recurring: command.recurring ?? false,
    coverMediaAssetId: command.coverMediaAssetId?.trim() || null,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
