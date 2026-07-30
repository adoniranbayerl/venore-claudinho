import type { OperationResult } from "@/shared/types";
import type { MediaRecord } from "../../../contracts/types";

export type UpdateMediaCategoryCommand = { id: string; categoryId: string | null; actorId: string; isMediaAdmin: boolean };
export type UpdateMediaCategoryInput = { id: string; categoryId: string | null };
export type UpdateMediaCategoryResult = OperationResult<MediaRecord>;
