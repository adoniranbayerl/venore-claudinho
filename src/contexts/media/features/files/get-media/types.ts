import type { OperationResult } from "@/shared/types";
import type { MediaRecord } from "../../../contracts/types";

export type GetMediaQuery = { id: string };
export type GetMediaResult = OperationResult<MediaRecord | null>;
