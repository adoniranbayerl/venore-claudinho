import type { OperationResult } from "@/shared/types";
import type { MediaCategory } from "../../../contracts/types";

export type CreateCategoryInput = { key: string; name: string };
export type CreateCategoryResult = OperationResult<MediaCategory>;
