import type { OperationResult } from "@/shared/types";
import type { EntryRecord, EntryVisibility } from "../../../contracts/types";

export type CreateEntryCommand = {
  contentTypeIds: string[];
  categoryId?: string;
  title: string;
  slug: string;
  visibility?: EntryVisibility;
  data?: unknown;
  mediaId?: string;
  // Ver comentário em contracts/types.ts (EntryRecord.internalOwner) — nunca vem de um form de
  // admin do CMS (create-entry action mapeia campo a campo do FormData, não passa isso adiante),
  // só de código de outro context (ex: academy) chamando createEntry via o barrel.
  internalOwner?: string;
  actorId: string;
};
export type CreateEntryInput = Omit<CreateEntryCommand, "actorId">;
export type CreateEntryResult = OperationResult<EntryRecord>;
