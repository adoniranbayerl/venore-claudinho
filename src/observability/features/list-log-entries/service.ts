import { findLogEntries } from "./store";
import type { ListLogEntriesQuery, ListLogEntriesResult } from "./types";

export async function listLogEntries(query: ListLogEntriesQuery = {}): Promise<ListLogEntriesResult> {
  const result = await findLogEntries(query);
  return { success: true, data: result };
}
