import type { OperationResult } from "@/shared/types";
import type { EntryRecord } from "../../../contracts/types";

export type GetEntryQuery = { id: string };
export type EntryView = EntryRecord;
export type GetEntryResult = OperationResult<EntryView | null>;
