import type { OperationResult } from "@/shared/types";
import type { ResolveBlockDefinition } from "../../../contracts/block-definition";
import type { EntryRecord } from "../../../contracts/types";

export type PublishEntryCommand = { id: string; resolveDefinition: ResolveBlockDefinition; actorId: string };
export type PublishEntryInput = Omit<PublishEntryCommand, "actorId">;
export type PublishEntryResult = OperationResult<EntryRecord>;
