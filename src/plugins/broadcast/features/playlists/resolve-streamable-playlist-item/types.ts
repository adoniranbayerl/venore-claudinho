import type { OperationResult } from "@/shared/types";

export type ResolveStreamableItemQuery = { itemId: string };

export type ResolveStreamableItem =
  | { kind: "local"; absolutePath: string; contentType: string; size: number }
  | { kind: "redirect"; url: string };

export type ResolveStreamableItemResult = OperationResult<ResolveStreamableItem>;
