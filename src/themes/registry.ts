import type { ThemeManifest } from "@/contexts/themes";
import * as venoreSlime from "./venore-slime";

export type ThemeSlotComponents = {
  Header: typeof venoreSlime.HeaderSlot;
  Footer: typeof venoreSlime.FooterSlot;
  Content: typeof venoreSlime.ContentSlot;
  SidebarRight: typeof venoreSlime.SidebarRightSlot;
};

export type ThemeRegistryEntry = { manifest: ThemeManifest; components: ThemeSlotComponents };

// Registro dos temas instalados em código (docs/venore-docks.md — "Sobre temas"). Next.js exige
// import estático para bundling, então instalar um tema novo é uma entrada nova aqui, não um
// scan de filesystem em runtime.
export const THEME_REGISTRY: Record<string, ThemeRegistryEntry> = {
  "venore-slime": {
    manifest: venoreSlime.venoreSlimeManifest,
    components: {
      Header: venoreSlime.HeaderSlot,
      Footer: venoreSlime.FooterSlot,
      Content: venoreSlime.ContentSlot,
      SidebarRight: venoreSlime.SidebarRightSlot,
    },
  },
};
