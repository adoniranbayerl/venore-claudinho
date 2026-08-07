export type LayerGeometry = { x: number; y: number; width: number; height: number };

// Mescla a geometria "drawer aberta" (layer.config.drawerVariant, se configurada) por cima da
// geometria base — mecanismo genérico por trás de "abrir uma drawer lateral encolhendo o vídeo"
// (plano original da Fase 5): qualquer layer pode declarar uma variante, não só a de vídeo.
export function resolveLayerGeometry(
  base: LayerGeometry,
  drawerVariant: Partial<LayerGeometry> | undefined,
  drawerOpen: boolean,
): LayerGeometry {
  if (!drawerOpen || !drawerVariant) return base;
  return { ...base, ...drawerVariant };
}
