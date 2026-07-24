import type { OperationResult } from "@/shared/types";
import type { ActiveThemeState } from "../../../contracts/types";

export type ActivateThemeInput = {
  themeKey: string;
  themeContractVersion: string;
};

export type ActivateThemeResult = OperationResult<ActiveThemeState>;
