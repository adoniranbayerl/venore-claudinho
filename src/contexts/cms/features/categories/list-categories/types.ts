import type { OperationResult } from "@/shared/types";
import type { CategoryRecord } from "../../../contracts/types";

export type ListCategoriesResult = OperationResult<Array<CategoryRecord & { entryCount: number }>>;
