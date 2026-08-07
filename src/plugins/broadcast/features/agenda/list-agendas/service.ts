import { findAllAgendas } from "./store";
import type { ListAgendasResult } from "./types";

export async function listAgendas(): Promise<ListAgendasResult> {
  return { success: true, data: await findAllAgendas() };
}
