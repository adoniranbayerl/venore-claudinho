import type { OperationResult } from "@/shared/types";
import type { CategoryRecord } from "../../../contracts/types";

export type ListCategoriesForAdminQuery = {
  // Fase C: recorta às categorias do escopo do ator. Injetado pelo handler; ausente = sem
  // recorte (admin global / superadmin).
  allowedCategoryIds?: string[];
};

export type ListCategoriesForAdminResult = OperationResult<Array<CategoryRecord & { entryCount: number }>>;
