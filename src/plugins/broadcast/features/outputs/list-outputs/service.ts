import { findAllOutputs } from "./store";
import type { ListOutputsResult } from "./types";

export async function listOutputs(): Promise<ListOutputsResult> {
  return { success: true, data: await findAllOutputs() };
}
