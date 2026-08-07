import type { CreateAgendaEventInput } from "./types";

export function validateCreateAgendaEventInput(input: CreateAgendaEventInput): { code: string; message: string } | null {
  if (!input.agendaId) {
    return { code: "broadcast.create-agenda-event.invalid_agenda", message: "Escolha uma agenda." };
  }
  if (!input.title || !input.title.trim()) {
    return { code: "broadcast.create-agenda-event.invalid_title", message: "Informe um título para o evento." };
  }
  if (!(input.startAt instanceof Date) || Number.isNaN(input.startAt.getTime())) {
    return { code: "broadcast.create-agenda-event.invalid_date", message: "Informe uma data válida." };
  }
  return null;
}
