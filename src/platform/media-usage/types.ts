// Contrato de "quem usa esta mídia" (docs/venore-docks.md — regras 11/12: media não pode
// depender de cms/brand/academy pra checar isso, então o contrato mora aqui em platform/, e cada
// consumidor implementa contra ele no próprio barrel — mesmo modelo de
// platform/breadcrumbs/types.ts e platform/admin-shell/admin-navigation.contracts.ts).
export type MediaUsageReference = {
  // Dono da referência — "cms", "brand", "academy". Usado só pra agrupar/filtrar providers, nunca
  // mostrado cru na UI (consumerLabel é o texto pra humano).
  consumerKey: string;
  consumerLabel: string;
  // Ex: "Entry: Página inicial", "Logo do cabeçalho", "Curso: Introdução ao X".
  label: string;
  // Link pra tela onde esse uso pode ser editado/removido.
  href: string;
};

export type MediaUsageProvider = (mediaId: string) => Promise<MediaUsageReference[]>;
