import { listMedia } from "./service";
import type { ListMediaResult } from "./types";

export async function listMediaHandler(): Promise<ListMediaResult> {
  return listMedia();
}
