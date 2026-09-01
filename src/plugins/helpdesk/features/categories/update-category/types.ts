import type { OperationResult } from "@/shared/types";
import type { CategoryRecord } from "../../../contracts/types";

export type UpdateCategoryCommand = {
  categoryId: string;
  label: string;
  description?: string | null;
  actorId: string;
};

export type UpdateCategoryInput = Omit<UpdateCategoryCommand, "actorId">;
export type UpdateCategoryResult = OperationResult<CategoryRecord>;
