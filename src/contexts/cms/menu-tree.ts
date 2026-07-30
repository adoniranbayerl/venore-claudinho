// Regras de árvore compartilhadas por todo use case que cria/reposiciona item de menu
// (create-menu-item, move-menu-item) — puro, sem acesso a banco, pra não duplicar a lógica de
// ciclo/profundidade em cada service.ts.

type TreeNode = { id: string; parentId: string | null };

// Profundidade máxima de um item de menu (raiz = 1). Vale pra qualquer location, inclusive
// "contextual" — não há exceção por tipo de menu.
export const MAX_MENU_ITEM_DEPTH = 4;

function buildParentIndex(items: TreeNode[]): Map<string, string | null> {
  return new Map(items.map((item) => [item.id, item.parentId]));
}

// Verdadeiro quando mover/criar `itemId` sob `newParentId` fecharia um ciclo — inclui o caso
// trivial de um item virar pai de si mesmo. Sobe de `newParentId` até a raiz procurando `itemId`.
export function wouldCreateCycle(items: TreeNode[], itemId: string, newParentId: string | null): boolean {
  if (!newParentId) return false;
  if (newParentId === itemId) return true;

  const parentOf = buildParentIndex(items);
  const seen = new Set<string>();
  let current: string | null = newParentId;

  while (current) {
    if (current === itemId) return true;
    if (seen.has(current)) break;
    seen.add(current);
    current = parentOf.get(current) ?? null;
  }

  return false;
}

// Profundidade de um item já existente em `items` (1 = raiz).
function depthOf(items: TreeNode[], id: string): number {
  const parentOf = buildParentIndex(items);
  const seen = new Set<string>();
  let depth = 1;
  let current = parentOf.get(id) ?? null;

  while (current) {
    if (seen.has(current)) break;
    seen.add(current);
    depth += 1;
    current = parentOf.get(current) ?? null;
  }

  return depth;
}

// Altura da subárvore enraizada em `itemId` (1 = folha/item sem filhos). Funciona também para um
// item que ainda não existe em `items` (caso de create-menu-item): sem filhos cadastrados, altura
// é 1.
function subtreeHeight(items: TreeNode[], itemId: string): number {
  const childrenByParent = new Map<string, string[]>();
  items.forEach((item) => {
    if (!item.parentId) return;
    const list = childrenByParent.get(item.parentId) ?? [];
    list.push(item.id);
    childrenByParent.set(item.parentId, list);
  });

  function heightOf(id: string): number {
    const children = childrenByParent.get(id) ?? [];
    if (children.length === 0) return 1;
    return 1 + Math.max(...children.map(heightOf));
  }

  return heightOf(itemId);
}

// Verdadeiro quando mover/criar `itemId` sob `newParentId` faria a subárvore dele (ou o próprio
// item, se for folha) ultrapassar MAX_MENU_ITEM_DEPTH.
export function wouldExceedMaxDepth(items: TreeNode[], itemId: string, newParentId: string | null): boolean {
  const newParentDepth = newParentId ? depthOf(items, newParentId) : 0;
  return newParentDepth + subtreeHeight(items, itemId) > MAX_MENU_ITEM_DEPTH;
}
