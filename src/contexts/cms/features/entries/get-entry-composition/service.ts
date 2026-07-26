import { getEntryComposition as extractComposition } from "../../../contracts/entry-body";
import { findEntryById } from "./store";
import type { GetEntryCompositionQuery, GetEntryCompositionResult } from "./types";

export async function getEntryComposition(query: GetEntryCompositionQuery): Promise<GetEntryCompositionResult> {
  const entry = await findEntryById(query.id);
  if (!entry) {
    return { success: false, error: { code: "cms.entries.not_found", message: `Entry "${query.id}" não encontrada.` } };
  }

  return { success: true, data: extractComposition(entry.data) };
}
