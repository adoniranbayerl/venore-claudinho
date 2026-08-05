import type { OperationResult } from "@/shared/types";
import type { MediaAsset } from "../../../contracts/types";

export type ListMediaAssetsQuery = { categoryId?: string };
export type ListMediaAssetsResult = OperationResult<MediaAsset[]>;
