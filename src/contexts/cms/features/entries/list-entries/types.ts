import type { OperationResult } from "@/shared/types";
import type { EntryRecord } from "../../../contracts/types";

export type ListEntriesQuery = { contentTypeId?: string; categoryId?: string };
export type EntryView = EntryRecord;
export type ListEntriesResult = OperationResult<EntryView[]>;
