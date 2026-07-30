import type { OperationResult } from "@/shared/types";
import type { MediaCategory } from "../../../contracts/types";

export type UpdateCategoryInput = { id: string; name: string };
export type UpdateCategoryResult = OperationResult<MediaCategory>;
