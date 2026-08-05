import { cache } from "react";
import type { BrandAesthetics } from "@/contexts/themes";
import { resolveActiveTheme } from "./resolve-active-theme";

// T2 (docs/implementation-roadmap.md — Fase 5): brand.mode/size/scrolledSize/position/color não
// vêm mais de contexts/settings — vêm do manifest do tema ativo. cache() pelo mesmo motivo de
// resolveActiveTheme: mais de um consumidor no mesmo request (layout.tsx, resolve-theme-slot-
// props.ts, admin/birthdays/page.tsx) sem duplicar a leitura de contexts/settings por trás de
// resolveActiveTheme.
export const resolveBrandAesthetics = cache(async (): Promise<BrandAesthetics> => {
  const { manifest } = await resolveActiveTheme();
  return manifest.brandAesthetics;
});
