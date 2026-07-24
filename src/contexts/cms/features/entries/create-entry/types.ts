import type { OperationResult } from "@/shared/types";
import type { EntryRecord } from "../../../contracts/types";

export type CreateEntryCommand = {
  contentTypeId: string;
  categoryId?: string;
  title: string;
  slug: string;
  data?: unknown;
  mediaId?: string;
  actorId: string;
};
export type CreateEntryInput = Omit<CreateEntryCommand, "actorId">;
export type CreateEntryResult = OperationResult<EntryRecord>;
