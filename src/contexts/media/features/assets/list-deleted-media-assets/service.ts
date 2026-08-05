import { findAllSoftDeletedAssets } from "./store";
import type { MediaAsset } from "../../../contracts/types";
import type { ListDeletedMediaAssetsResult } from "./types";

export async function listDeletedMediaAssets(): Promise<ListDeletedMediaAssetsResult> {
  const media = await findAllSoftDeletedAssets();
  return { success: true, data: media };
}

// Sem OperationResult/RBAC de propósito — só o sweep de autopurge (processo de sistema, sem ator
// humano) chama isto, exportado direto do barrel do media (mesmo padrão de
// validateMediaUploadCandidate em request-media-upload-ticket/service.ts).
export async function listSoftDeletedAssetsOlderThan(cutoff: Date): Promise<MediaAsset[]> {
  return findAllSoftDeletedAssets(cutoff);
}
