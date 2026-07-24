import { resolveActiveTheme } from "@/platform/theme-rendering/resolve-active-theme";
import { resolveThemeSlotProps } from "@/platform/theme-rendering/resolve-theme-slot-props";

// Prova mínima e descartável do contrato de slot — não é uma rota real, já que ainda não existe
// pipeline de resolução de página (CMS) para alimentar isto de verdade.
//
// force-dynamic: o tema ativo é trocável em runtime sem rebuild (docs/venore-docks.md — "Sobre
// temas"). Prerender estático assinaria o tema ativo no momento do build, contradizendo isso.
export const dynamic = "force-dynamic";
export default async function ThemePreviewPage() {
  const { components: Slots } = await resolveActiveTheme();
  const props = resolveThemeSlotProps();

  return (
    <>
      <Slots.Header {...props.header} />
      <Slots.Content sidebarContextualEnabled={false}>
        <p>Theme contract preview.</p>
      </Slots.Content>
      <Slots.SidebarRight {...props.sidebarRight} />
      <Slots.Footer {...props.footer} />
    </>
  );
}
