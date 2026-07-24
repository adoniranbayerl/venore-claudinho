import type { OperationResult } from "@/shared/types";
import type { EntryRecord } from "../../../contracts/types";

export type PublishEntryCommand = { id: string; actorId: string };
export type PublishEntryInput = Omit<PublishEntryCommand, "actorId">;
export type PublishEntryResult = OperationResult<EntryRecord>;
