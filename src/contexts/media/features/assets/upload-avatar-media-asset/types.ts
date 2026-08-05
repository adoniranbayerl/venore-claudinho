import type { OperationResult } from "@/shared/types";
import type { MediaAsset } from "../../../contracts/types";

export type UploadAvatarMediaAssetCommand = {
  filename: string;
  contentType: string;
  size: number;
  data: Buffer;
  actorId: string;
};
export type UploadAvatarMediaAssetInput = Omit<UploadAvatarMediaAssetCommand, "actorId">;
export type UploadAvatarMediaAssetResult = OperationResult<MediaAsset>;
