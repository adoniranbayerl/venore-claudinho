import type { OperationResult } from "@/shared/types";
import type { MediaAsset } from "../../../contracts/types";

export type UploadTicketAttachmentMediaAssetCommand = {
  filename: string;
  contentType: string;
  size: number;
  data: Buffer;
  actorId: string;
};
export type UploadTicketAttachmentMediaAssetInput = Omit<UploadTicketAttachmentMediaAssetCommand, "actorId">;
export type UploadTicketAttachmentMediaAssetResult = OperationResult<MediaAsset>;
