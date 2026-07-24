import type { ThemeManifest } from "@/contexts/themes";
import * as defaultTheme from "./default";

export type ThemeSlotComponents = {
  Header: typeof defaultTheme.HeaderSlot;
  Footer: typeof defaultTheme.FooterSlot;
  Content: typeof defaultTheme.ContentSlot;
  SidebarRight: typeof defaultTheme.SidebarRightSlot;
};

export type ThemeRegistryEntry = { manifest: ThemeManifest; components: ThemeSlotComponents };

// Registro dos temas instalados em código (docs/venore-docks.md — "Sobre temas"). Next.js exige
// import estático para bundling, então instalar um tema novo é uma entrada nova aqui, não um
// scan de filesystem em runtime.
export const THEME_REGISTRY: Record<string, ThemeRegistryEntry> = {
  default: {
    manifest: defaultTheme.defaultThemeManifest,
    components: {
      Header: defaultTheme.HeaderSlot,
      Footer: defaultTheme.FooterSlot,
      Content: defaultTheme.ContentSlot,
      SidebarRight: defaultTheme.SidebarRightSlot,
    },
  },
};
