import type { UpdateAgendaEventInput } from "./types";

export function validateUpdateAgendaEventInput(input: UpdateAgendaEventInput): { code: string; message: string } | null {
  if (!input.eventId) {
    return { code: "broadcast.update-agenda-event.invalid_event", message: "Evento inválido." };
  }
  if (!input.title || !input.title.trim()) {
    return { code: "broadcast.update-agenda-event.invalid_title", message: "Informe um título para o evento." };
  }
  if (!(input.startAt instanceof Date) || Number.isNaN(input.startAt.getTime())) {
    return { code: "broadcast.update-agenda-event.invalid_date", message: "Informe uma data válida." };
  }
  return null;
}
