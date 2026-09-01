import type { OperationResult } from "@/shared/types";
import type { CategoryRecord } from "../../../contracts/types";

export type CreateCategoryCommand = {
  queueId: string;
  label: string;
  description?: string | null;
  actorId: string;
};

export type CreateCategoryInput = Omit<CreateCategoryCommand, "actorId">;
export type CreateCategoryResult = OperationResult<CategoryRecord>;
