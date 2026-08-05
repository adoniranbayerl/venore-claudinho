import type { OperationResult } from "@/shared/types";
import type { ActiveColorPaletteState } from "../../../contracts/types";

export type ActivateColorPaletteInput = { paletteId: string };
export type ActivateColorPaletteResult = OperationResult<ActiveColorPaletteState>;
