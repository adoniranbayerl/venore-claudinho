import type { OperationResult } from "@/shared/types";
import type { CategoryRecord } from "../../../contracts/types";

export type CreateCategoryCommand = {
  key: string;
  slug: string;
  name: string;
  description?: string;
  actorId: string;
};
export type CreateCategoryInput = Omit<CreateCategoryCommand, "actorId">;
export type CreateCategoryResult = OperationResult<CategoryRecord>;
