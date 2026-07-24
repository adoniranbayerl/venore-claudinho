import { defaultThemeMockProps } from "@/themes/default/mock-data";
import type { HeaderSlotProps, FooterSlotProps, SidebarRightSlotProps } from "@/contexts/themes";

// TODO: substituir por composição real de contexts/cms + contexts/rbac (nav resolvida por
// permissão, brand de settings do CMS) quando esses contexts existirem. Até lá, este é o ÚNICO
// lugar do sistema onde dado mockado vira prop de slot — nunca dentro do próprio tema.
export function resolveThemeSlotProps(): {
  header: HeaderSlotProps;
  footer: FooterSlotProps;
  sidebarRight: SidebarRightSlotProps;
} {
  return defaultThemeMockProps;
}
