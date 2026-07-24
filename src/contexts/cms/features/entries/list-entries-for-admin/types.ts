import type { OperationResult } from "@/shared/types";
import type { EntryRecord, EntryStatus } from "../../../contracts/types";

export type ListEntriesForAdminQuery = { contentTypeId?: string; categoryId?: string; status?: EntryStatus };
export type ListEntriesForAdminResult = OperationResult<EntryRecord[]>;
