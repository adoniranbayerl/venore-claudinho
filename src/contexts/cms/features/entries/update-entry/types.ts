import type { OperationResult } from "@/shared/types";
import type { EntryRecord } from "../../../contracts/types";

export type UpdateEntryCommand = {
  id: string;
  title?: string;
  slug?: string;
  categoryId?: string | null;
  data?: unknown;
  mediaId?: string | null;
  actorId: string;
};
export type UpdateEntryInput = Omit<UpdateEntryCommand, "actorId">;
export type UpdateEntryResult = OperationResult<EntryRecord>;
