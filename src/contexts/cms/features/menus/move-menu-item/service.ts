import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { beginOperation, endOperation } from "@/observability";
import { MAX_MENU_ITEM_DEPTH, wouldCreateCycle, wouldExceedMaxDepth } from "../../../menu-tree";
import { applyMenuItemPositions, findMenuItemById, findMenuItemsByMenuId } from "./store";
import type { MoveMenuItemCommand, MoveMenuItemResult } from "./types";

export async function moveMenuItem(command: MoveMenuItemCommand): Promise<MoveMenuItemResult> {
  const handle = beginOperation({
    useCase: "cms.move-menu-item",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const item = await findMenuItemById(command.id);
  if (!item) {
    const error = { code: "cms.menus.item_not_found", message: `Item de menu "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const siblings = await findMenuItemsByMenuId(item.menuId);

  if (command.parentId) {
    const parent = siblings.find((candidate) => candidate.id === command.parentId);
    if (!parent) {
      const error = {
        code: "cms.menus.parent_not_found",
        message: `Item pai "${command.parentId}" não encontrado neste menu.`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  // Proteção contra ciclo roda antes do cálculo de profundidade de propósito — um pai que já é
  // descendente do item nunca deveria nem chegar na checagem de altura.
  if (wouldCreateCycle(siblings, command.id, command.parentId)) {
    const error = {
      code: "cms.menus.cycle_detected",
      message: "Não é possível mover um item de menu para dentro da própria subárvore.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (wouldExceedMaxDepth(siblings, command.id, command.parentId)) {
    const error = {
      code: "cms.menus.max_depth_exceeded",
      message: `Mover este item excederia a profundidade máxima permitida (${MAX_MENU_ITEM_DEPTH}).`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const updates = computePositionUpdates(siblings, command.id, command.parentId, command.order);
  const updated = await applyMenuItemPositions(updates);

  invalidateCacheByPrefix("cms:navigation");

  endOperation(handle, { success: true });
  return { success: true, data: updated };
}

// Remove o item do grupo de irmãos de origem, insere no grupo de destino na posição pedida
// (clamped), e reindexa os dois grupos pra order contígua começando em 0. Quando origem e
// destino são o mesmo pai, os dois grupos são o mesmo — o item só reaparece uma vez.
function computePositionUpdates(
  allItems: Array<{ id: string; parentId: string | null; order: number }>,
  itemId: string,
  newParentId: string | null,
  requestedOrder: number,
): Array<{ id: string; parentId: string | null; order: number }> {
  const moving = allItems.find((candidate) => candidate.id === itemId);
  if (!moving) return [];

  const oldParentId = moving.parentId;

  const destinationSiblings = allItems
    .filter((candidate) => candidate.parentId === newParentId && candidate.id !== itemId)
    .sort((left, right) => left.order - right.order);

  const clampedOrder = Math.max(0, Math.min(requestedOrder, destinationSiblings.length));
  destinationSiblings.splice(clampedOrder, 0, { id: itemId, parentId: newParentId, order: 0 });

  const destinationUpdates = destinationSiblings.map((sibling, index) => ({
    id: sibling.id,
    parentId: newParentId,
    order: index,
  }));

  if (oldParentId === newParentId) {
    return destinationUpdates;
  }

  const originSiblings = allItems
    .filter((candidate) => candidate.parentId === oldParentId && candidate.id !== itemId)
    .sort((left, right) => left.order - right.order);

  const originUpdates = originSiblings.map((sibling, index) => ({
    id: sibling.id,
    parentId: oldParentId,
    order: index,
  }));

  return [...destinationUpdates, ...originUpdates];
}
