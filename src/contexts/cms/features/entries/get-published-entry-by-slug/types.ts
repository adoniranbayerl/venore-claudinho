import type { OperationResult } from "@/shared/types";
import type { EntryRecord } from "../../../contracts/types";

export type GetPublishedEntryBySlugQuery = { categoryId: string | null; slug: string };
export type GetPublishedEntryBySlugResult = OperationResult<EntryRecord | null>;
