import type { ThemeManifest } from "@/contexts/themes";

// Segundo tema, mínimo e deliberadamente feio — só existe para provar que trocar o tema ativo
// troca a shell (docs/themes/shell-contract.md, Fase 2). Não é um tema "de produto".
export const venoreBasicManifest: ThemeManifest = {
  key: "venore-basic",
  name: "Venore Basic (prova de conceito)",
  version: "0.1.0",
  themeContractVersion: "6.0.0",
};
