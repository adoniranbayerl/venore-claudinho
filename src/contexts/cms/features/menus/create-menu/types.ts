import type { OperationResult } from "@/shared/types";
import type { MenuLocation, MenuRecord } from "../../../contracts/types";

export type CreateMenuCommand = {
  key: string;
  name: string;
  location: MenuLocation;
  // Obrigatório e único quando location === "contextual"; deve ser omitido/nulo nas demais.
  scopePath?: string | null;
  actorId: string;
};
export type CreateMenuInput = Omit<CreateMenuCommand, "actorId">;
export type CreateMenuResult = OperationResult<MenuRecord>;
