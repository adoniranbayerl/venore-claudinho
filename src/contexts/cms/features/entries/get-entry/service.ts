import { findEntryById } from "./store";
import { toEntryView } from "./view";
import type { GetEntryQuery, GetEntryResult } from "./types";

export async function getEntry(query: GetEntryQuery): Promise<GetEntryResult> {
  const record = await findEntryById(query.id);
  return { success: true, data: record ? toEntryView(record) : null };
}
