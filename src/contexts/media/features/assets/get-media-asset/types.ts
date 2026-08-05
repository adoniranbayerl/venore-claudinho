import type { OperationResult } from "@/shared/types";
import type { MediaAsset } from "../../../contracts/types";

export type GetMediaAssetQuery = { id: string };
export type GetMediaAssetResult = OperationResult<MediaAsset | null>;
