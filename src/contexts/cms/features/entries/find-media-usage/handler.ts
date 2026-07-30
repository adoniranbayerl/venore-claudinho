import { findMediaUsage } from "./service";
import type { FindMediaUsageResult } from "./types";

// Sem auth própria: só quem já tem media.manage chega até aqui, via
// platform/media-usage/media-usage-registry.ts (regra 12/14 — composição fora dos dois contexts).
export async function findMediaUsageHandler(mediaId: string): Promise<FindMediaUsageResult> {
  return findMediaUsage({ mediaId });
}
