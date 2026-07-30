import type { BlockRendererComponent } from "@/platform/page-builder/block-renderers";
import { BirthdaysMonthListBlock } from "./birthdays-month-list-block";

export const blockRenderers: Record<string, BlockRendererComponent> = {
  "birthdays.month.list": BirthdaysMonthListBlock,
};
