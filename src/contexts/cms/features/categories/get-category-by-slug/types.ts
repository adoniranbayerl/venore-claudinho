import type { OperationResult } from "@/shared/types";
import type { CategoryRecord } from "../../../contracts/types";

export type GetCategoryBySlugQuery = { slug: string };
export type GetCategoryBySlugResult = OperationResult<CategoryRecord | null>;
