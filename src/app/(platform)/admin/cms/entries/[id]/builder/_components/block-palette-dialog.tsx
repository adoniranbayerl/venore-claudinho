"use client";

import type { BlockDefinition } from "@/contexts/cms";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// A lista já chega filtrada pela regra de posição do destino (raiz ou allowedBlockKeys da area) —
// este componente só agrupa por categoria e devolve a escolha.
export function BlockPaletteDialog({
  open,
  onOpenChange,
  definitions,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definitions: BlockDefinition[];
  onSelect: (definition: BlockDefinition) => void;
}) {
  const byCategory = new Map<string, BlockDefinition[]>();
  for (const definition of definitions) {
    const list = byCategory.get(definition.category) ?? [];
    list.push(definition);
    byCategory.set(definition.category, list);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar bloco</DialogTitle>
        </DialogHeader>

        {definitions.length === 0 && (
          <p className="text-sm text-muted-foreground/56">Nenhum bloco pode ser adicionado nesta posição.</p>
        )}

        <div className="max-h-96 space-y-4 overflow-y-auto">
          {Array.from(byCategory.entries()).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-medium text-muted-foreground/56 uppercase">{category}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {items.map((definition) => (
                  <button
                    key={definition.key}
                    type="button"
                    onClick={() => {
                      onSelect(definition);
                      onOpenChange(false);
                    }}
                    className="rounded border border-border p-2 text-left text-sm text-foreground hover:border-ring hover:bg-accent"
                  >
                    {definition.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
