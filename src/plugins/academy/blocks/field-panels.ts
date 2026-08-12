import type { BlockFieldPanelComponent } from "@/platform/page-builder/block-field-panels";
import { NotationSheetFieldPanel } from "./notation-sheet-field-panel";

export const blockFieldPanels: Record<string, BlockFieldPanelComponent> = {
  "academy.notation.sheet": NotationSheetFieldPanel,
};
