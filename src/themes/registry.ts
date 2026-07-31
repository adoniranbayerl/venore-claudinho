import type { ComponentType } from "react";
import type { ThemeManifest, ThemeShellProps } from "@/contexts/themes";
import * as venoreSlime from "./venore-slime";
import * as venoreBasic from "./venore-basic";
import * as venoreNightcity from "./venore-nightcity";

export type ThemeShellComponent = ComponentType<ThemeShellProps>;

export type ThemeRegistryEntry = { manifest: ThemeManifest; Shell: ThemeShellComponent };

// Registro dos temas instalados em código (docs/venore-docks.md — "Sobre temas"). Next.js exige
// import estático para bundling, então instalar um tema novo é uma entrada nova aqui, não um
// scan de filesystem em runtime. `Shell` é o único componente que o registro exige — quem decide
// a árvore/arranjo entre as regiões (header, footer, sidebar, conteúdo) é o próprio tema
// (docs/themes/shell-contract.md — Abordagem A), não este arquivo.
export const THEME_REGISTRY: Record<string, ThemeRegistryEntry> = {
  "venore-slime": {
    manifest: venoreSlime.venoreSlimeManifest,
    Shell: venoreSlime.Shell,
  },
  "venore-basic": {
    manifest: venoreBasic.venoreBasicManifest,
    Shell: venoreBasic.Shell,
  },
  "venore-nightcity": {
    manifest: venoreNightcity.venoreNightcityManifest,
    Shell: venoreNightcity.Shell,
  },
};
