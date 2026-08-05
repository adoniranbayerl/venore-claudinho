import type { Block, Composition } from "@/contexts/cms";

// Convenção compartilhada pelos três blocos que referenciam mídia hoje (core.content.image,
// core.content.card, core.content.audio — platform/page-builder/blocks/*.ts): o campo sempre se
// chama `data.mediaId`. Andar a árvore por essa convenção (em vez de conhecer cada block key)
// cobre blocks futuros de graça, contanto que sigam a mesma convenção — e não quebra se não
// seguirem (o campo simplesmente não é encontrado, mediaId original permanece intocado).
function hasMediaIdField(data: Record<string, unknown>): data is Record<string, unknown> & { mediaId: string | null } {
  return "mediaId" in data && (typeof data.mediaId === "string" || data.mediaId === null);
}

function walkBlocks(blocks: Block[], visit: (block: Block) => Block): Block[] {
  return blocks.map((block) => {
    const visited = visit(block);
    return { ...visited, areas: visited.areas.map((area) => ({ ...area, blocks: walkBlocks(area.blocks, visit) })) };
  });
}

// Reescreve mediaId em toda a composição usando `resolveRef`, que recebe o mediaId original e
// devolve o novo valor (checksum no export, id de destino no import) — ou null se não deve/pode
// ser resolvido (aí o campo vira null em vez de apontar pra um id que não existe mais).
export function remapCompositionMediaIds(composition: Composition, resolveRef: (mediaId: string) => string | null): Composition {
  return walkBlocks(composition, (block) => {
    if (!hasMediaIdField(block.data) || !block.data.mediaId) {
      return block;
    }
    return { ...block, data: { ...block.data, mediaId: resolveRef(block.data.mediaId) } };
  });
}
