import type { ReactNode } from "react";
import type { Block, BlockDefinition } from "@/contexts/cms";
import { blockFieldPanels as academyBlockFieldPanels } from "@/plugins/academy/blocks/field-panels";

// Mesmo contrato de props de BlockFieldsPanel (block-fields-panel.tsx) — troca de painel é
// transparente pro caller (composition-builder.tsx). Um bloco só ganha um painel aqui quando o
// campo que ele precisa editar não cabe em nenhum EditorFieldType genérico (ex: um compositor
// visual de notas) — todo outro bloco continua sem entrada aqui e usa o BlockFieldsPanel genérico.
export type BlockFieldPanelProps = {
  block: Block;
  definition: BlockDefinition;
  errorMessage: string | null;
  onChange: (data: Record<string, unknown>) => void;
};
export type BlockFieldPanelComponent = (props: BlockFieldPanelProps) => ReactNode;

// IMPORTANTE: importa direto de "@/plugins/academy/blocks/field-panels" — nunca de
// "@/plugins/academy" nem "@/plugins/academy/blocks". Este arquivo é alcançável a partir de
// composition-builder.tsx ("use client"); o barrel do plugin (index.ts) reexporta blockRenderers
// do mesmo "./blocks", que puxa handler -> @/contexts/auth -> next-auth. Importar pelo caminho
// errado vazaria esse encadeamento pro bundle client do builder do CMS (mesmo motivo de
// block-renderers.tsx ser "server-only" e nunca ser importado por código client).
// Superset chaveado por block key, igual PLUGIN_BLOCK_RENDERER_BARRELS. Não filtra por plugin
// ativo: o painel só é consultado (composition-builder.tsx: blockFieldPanels[block.key]) pra um
// bloco que já está no palette, e o palette (listBlockDefinitions(activePluginKeys)) é quem
// remove os blocos de plugin desativado — uma entrada órfã aqui nunca é alcançada.
const PLUGIN_BLOCK_FIELD_PANEL_BARRELS: Record<string, { blockFieldPanels?: Record<string, BlockFieldPanelComponent> }> = {
  academy: { blockFieldPanels: academyBlockFieldPanels },
};

function collectPluginFieldPanels(): Record<string, BlockFieldPanelComponent> {
  return Object.assign(
    {},
    ...Object.values(PLUGIN_BLOCK_FIELD_PANEL_BARRELS).map((barrel) => barrel.blockFieldPanels ?? {}),
  );
}

// Exportado como mapa, não como função resolveBlockFieldPanel(key) — o único consumidor
// (composition-builder.tsx) é um client component com hooks, e react-hooks/static-components não
// aceita escolher dinamicamente uma tag JSX a partir do retorno de uma chamada de função dentro do
// corpo de um componente assim; indexar um Record (mesmo padrão de ICON_COMPONENTS em
// block-renderers.tsx) é reconhecido como referência estável.
export const blockFieldPanels: Record<string, BlockFieldPanelComponent> = collectPluginFieldPanels();
