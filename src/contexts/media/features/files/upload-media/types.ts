import type { OperationResult } from "@/shared/types";
import type { MediaRecord, MediaVisibility } from "../../../contracts/types";

export type UploadMediaCommand = {
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  actorId: string;
  visibility: MediaVisibility;
};
// `visibility` é opcional na entrada: default "private" é decidido no handler, nunca deixado
// implícito na camada de banco sozinha (nenhum upload nasce público por omissão).
export type UploadMediaInput = Omit<UploadMediaCommand, "actorId" | "visibility"> & { visibility?: MediaVisibility };
export type UploadMediaResult = OperationResult<MediaRecord>;
