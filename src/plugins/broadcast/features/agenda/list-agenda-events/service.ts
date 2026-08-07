import { findAllAgendaEvents } from "./store";
import type { ListAgendaEventsResult } from "./types";

export async function listAgendaEvents(): Promise<ListAgendaEventsResult> {
  return { success: true, data: await findAllAgendaEvents() };
}
