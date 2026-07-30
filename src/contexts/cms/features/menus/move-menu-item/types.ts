import type { OperationResult } from "@/shared/types";
import type { MenuItemRecord } from "../../../contracts/types";

export type MoveMenuItemCommand = {
  id: string;
  // Novo pai (null = raiz).
  parentId: string | null;
  // Posição entre os irmãos do novo pai, 0-based.
  order: number;
  actorId: string;
};
export type MoveMenuItemInput = Omit<MoveMenuItemCommand, "actorId">;
export type MoveMenuItemResult = OperationResult<MenuItemRecord[]>;
