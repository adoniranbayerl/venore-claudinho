import type { BlockRendererComponent } from "@/platform/page-builder/block-renderers";
import { DonationsPixWidgetBlock } from "./donations-pix-widget-block";
import { DonationsPixTeaserBlock } from "./donations-pix-teaser-block";

export const blockRenderers: Record<string, BlockRendererComponent> = {
  "donations.pix-widget": DonationsPixWidgetBlock,
  "donations.pix-teaser": DonationsPixTeaserBlock,
};
