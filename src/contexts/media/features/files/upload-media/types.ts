import type { OperationResult } from "@/shared/types";
import type { MediaRecord } from "../../../contracts/types";

export type UploadMediaCommand = {
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  actorId: string;
};
export type UploadMediaInput = Omit<UploadMediaCommand, "actorId">;
export type UploadMediaResult = OperationResult<MediaRecord>;
