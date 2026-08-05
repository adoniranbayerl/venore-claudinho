import type { OperationResult } from "@/shared/types";
import type { MediaAsset, MediaVisibility } from "../../../contracts/types";

export type UploadMediaAssetCommand = {
  filename: string;
  contentType: string;
  size: number;
  data: Buffer;
  visibility: MediaVisibility;
  categoryId?: string | null;
  actorId: string;
};
export type UploadMediaAssetInput = Omit<UploadMediaAssetCommand, "actorId">;
export type UploadMediaAssetResult = OperationResult<MediaAsset>;
