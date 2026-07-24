import type { OperationResult } from "@/shared/types";
import type { ContentTypeRecord } from "../../../contracts/types";

export type CreateContentTypeCommand = {
  key: string;
  name: string;
  description?: string;
  actorId: string;
};
export type CreateContentTypeInput = Omit<CreateContentTypeCommand, "actorId">;
export type CreateContentTypeResult = OperationResult<ContentTypeRecord>;
