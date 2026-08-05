import type { OperationResult } from "@/shared/types";
import type { EntryRecord } from "../../../contracts/types";

export type ArchiveEntryCommand = { id: string; actorId: string };
export type ArchiveEntryInput = Omit<ArchiveEntryCommand, "actorId">;
export type ArchiveEntryResult = OperationResult<EntryRecord>;
