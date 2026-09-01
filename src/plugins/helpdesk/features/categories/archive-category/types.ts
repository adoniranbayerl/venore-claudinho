import type { OperationResult } from "@/shared/types";
import type { CategoryRecord } from "../../../contracts/types";

export type ArchiveCategoryCommand = {
  categoryId: string;
  archived: boolean;
  actorId: string;
};

export type ArchiveCategoryInput = Omit<ArchiveCategoryCommand, "actorId">;
export type ArchiveCategoryResult = OperationResult<CategoryRecord>;
