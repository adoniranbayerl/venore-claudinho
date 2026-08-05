import { getActiveColorPalette } from "./service";
import type { GetActiveColorPaletteResult } from "./types";

export async function getActiveColorPaletteHandler(): Promise<GetActiveColorPaletteResult> {
  return getActiveColorPalette();
}
