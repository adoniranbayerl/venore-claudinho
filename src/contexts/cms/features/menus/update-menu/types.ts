import type { OperationResult } from "@/shared/types";
import type { MenuRecord } from "../../../contracts/types";

export type UpdateMenuCommand = {
  id: string;
  name?: string;
  // Só tem efeito em menu contextual — renomear o escopo de um menu de location fixa é rejeitado.
  scopePath?: string;
  actorId: string;
};
export type UpdateMenuInput = Omit<UpdateMenuCommand, "actorId">;
export type UpdateMenuResult = OperationResult<MenuRecord>;
