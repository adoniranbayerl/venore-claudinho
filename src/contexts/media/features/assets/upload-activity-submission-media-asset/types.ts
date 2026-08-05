import type { OperationResult } from "@/shared/types";
import type { MediaAsset } from "../../../contracts/types";

export type UploadActivitySubmissionMediaAssetCommand = {
  filename: string;
  contentType: string;
  size: number;
  data: Buffer;
  actorId: string;
};
export type UploadActivitySubmissionMediaAssetInput = Omit<UploadActivitySubmissionMediaAssetCommand, "actorId">;
export type UploadActivitySubmissionMediaAssetResult = OperationResult<MediaAsset>;
