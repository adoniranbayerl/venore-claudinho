import { findEvents } from "./store";
import type { ListEventsQuery, ListEventsResult } from "./types";

export async function listEvents(query: ListEventsQuery = {}): Promise<ListEventsResult> {
  const result = await findEvents(query);
  return { success: true, data: result };
}
