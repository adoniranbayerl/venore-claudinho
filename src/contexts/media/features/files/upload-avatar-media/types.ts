import type { OperationResult } from "@/shared/types";
import type { MediaRecord } from "../../../contracts/types";

export type UploadAvatarMediaCommand = {
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  actorId: string;
};
export type UploadAvatarMediaInput = Omit<UploadAvatarMediaCommand, "actorId">;
export type UploadAvatarMediaResult = OperationResult<MediaRecord>;
