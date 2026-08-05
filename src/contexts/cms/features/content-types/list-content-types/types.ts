import type { OperationResult } from "@/shared/types";
import type { ContentTypeRecord } from "../../../contracts/types";

export type ListContentTypesResult = OperationResult<Array<ContentTypeRecord & { entryCount: number }>>;
