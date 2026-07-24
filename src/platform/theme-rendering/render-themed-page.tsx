import type { ReactNode } from "react";
import { resolveActiveTheme } from "./resolve-active-theme";
import { resolveThemeSlotProps } from "./resolve-theme-slot-props";

// Composição de slots reaproveitada por toda página pública renderizada pelo tema ativo (contrato
// de slot em docs/venore-docks.md — "Sobre temas"). O conteúdo já vem resolvido como children do
// ContentSlot; o tema só recebe e renderiza.
export async function renderThemedPage({
  children,
  sidebarContextualEnabled,
}: {
  children: ReactNode;
  sidebarContextualEnabled: boolean;
}) {
  const { components: Slots } = await resolveActiveTheme();
  const props = resolveThemeSlotProps();

  return (
    <>
      <Slots.Header {...props.header} />
      <Slots.Content sidebarContextualEnabled={sidebarContextualEnabled}>{children}</Slots.Content>
      <Slots.SidebarRight {...props.sidebarRight} />
      <Slots.Footer {...props.footer} />
    </>
  );
}
