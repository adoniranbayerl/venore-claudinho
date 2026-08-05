import type { MediaAsset } from "@/contexts/media/contracts/types";
import type { OperationResult } from "@/shared/types";

export type RegisterUploadedMediaCommand = {
  // Nome original do arquivo (o browser já sabe, não precisa ir e voltar pelo ticket) — ver
  // contracts/types.ts MediaAsset.filename.
  filename: string;
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
