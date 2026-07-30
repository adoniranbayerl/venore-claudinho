import type { OperationResult } from "@/shared/types";
import type { MediaRecord } from "../../../contracts/types";

export type ListMediaQuery = { categoryId?: string };
export type ListMediaResult = OperationResult<MediaRecord[]>;
