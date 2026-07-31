import { findAuditEvents } from "./store";
import type { ListAuditEventsQuery, ListAuditEventsResult } from "./types";

export async function listAuditEvents(query: ListAuditEventsQuery = {}): Promise<ListAuditEventsResult> {
  const result = await findAuditEvents(query);
  return { success: true, data: result };
}
