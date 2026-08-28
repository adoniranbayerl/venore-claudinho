import type { OperationResult } from "@/shared/types";
import type { EntryRecord, EntryStatus } from "../../../contracts/types";

export type ListEntriesForAdminQuery = {
  contentTypeId?: string;
  categoryId?: string;
  status?: EntryStatus;
  // Fase C: quando presente, recorta a listagem às categorias do escopo do ator (editor/author
  // escopado). Ausente = sem recorte (admin global / superadmin). Array vazio = nenhuma entry.
  // Injetado pelo handler a partir de resolveScopeForActor — não vem do form.
  allowedCategoryIds?: string[];
};
export type ListEntriesForAdminResult = OperationResult<EntryRecord[]>;
