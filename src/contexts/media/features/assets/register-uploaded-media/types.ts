import type { MediaAsset } from "@/contexts/media/contracts/types";
import type { OperationResult } from "@/shared/types";

export type RegisterUploadedMediaCommand = {
  pathname: string;
  url: string;
  contentType: string;
  size: number;
  checksum: string;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  actorId: string;
};

export type RegisterUploadedMediaResult = OperationResult<MediaAsset>;
