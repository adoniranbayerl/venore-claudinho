"use client";

import { ChevronDownIcon, ChevronRightIcon, CopyIcon, PlusIcon, TrashIcon } from "lucide-react";
import type { Block, BlockDefinition, Composition } from "@/contexts/cms";
import { cn } from "@/lib/utils";
import { ROW_BLOCK_KEY, ROW_MAX_COLUMNS, resolveRowColumns } from "@/platform/page-builder/row-columns";

export type BlockTreeActions = {
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onAddSibling: (id: string) => void;
  onAddChild: (parentId: string, areaKey: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onSetColumns: (id: string, columns: number) => void;
};

export function BlockTree({
  blocks,
  definitionsByKey,
  selectedId,
  errorBlockId,
  collapsed,
  actions,
}: {
  blocks: Composition;
  definitionsByKey: Map<string, BlockDefinition>;
  selectedId: string | null;
  errorBlockId: string | null;
  collapsed: Set<string>;
  actions: BlockTreeActions;
}) {
  if (blocks.length === 0) {
    return <p className="pl-2 text-xs text-text-tertiary">Vazio.</p>;
  }

  return (
    <ul className="space-y-1">
      {blocks.map((block, index) => (
        <li key={block.id}>
          <BlockNode
            block={block}
            definition={definitionsByKey.get(block.key) ?? null}
            definitionsByKey={definitionsByKey}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
            selectedId={selectedId}
            errorBlockId={errorBlockId}
            collapsed={collapsed}
            actions={actions}
          />
        </li>
      ))}
    </ul>
  );
}

function BlockNode({
  block,
  definition,
  definitionsByKey,
  isFirst,
  isLast,
  selectedId,
  errorBlockId,
  collapsed,
  actions,
}: {
  block: Block;
  definition: BlockDefinition | null;
  definitionsByKey: Map<string, BlockDefinition>;
  isFirst: boolean;
  isLast: boolean;
  selectedId: string | null;
  errorBlockId: string | null;
  collapsed: Set<string>;
  actions: BlockTreeActions;
}) {
  const hasAreas = block.areas.length > 0;
  const isCollapsed = collapsed.has(block.id);
  const isSelected = selectedId === block.id;
  const hasError = errorBlockId === block.id;

  // Row só mostra as N primeiras colunas (mesma regra do render público) — bloco em coluna
  // oculta continua no dado, e o editor precisa deixar isso visível em vez de escondê-lo de vez.
  const isRow = block.key === ROW_BLOCK_KEY;
  const columns = isRow ? resolveRowColumns(block.data) : block.areas.length;
  const visibleAreas = isRow ? block.areas.slice(0, columns) : block.areas;
  const hiddenAreas = isRow ? block.areas.slice(columns) : [];
  const hiddenBlockCount = hiddenAreas.reduce((sum, area) => sum + area.blocks.length, 0);
  const nextColumns = Math.min(ROW_MAX_COLUMNS, columns + 1);

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded border px-2 py-1.5",
          isSelected ? "border-primary bg-accent" : "border-transparent hover:border-border-subtle",
          hasError && "border-destructive",
        )}
      >
        {hasAreas ? (
          <button
            type="button"
            onClick={() => actions.onToggleCollapse(block.id)}
            className="text-text-tertiary"
            aria-label={isCollapsed ? "Expandir" : "Recolher"}
          >
            {isCollapsed ? <ChevronRightIcon className="size-3.5" /> : <ChevronDownIcon className="size-3.5" />}
          </button>
        ) : (
          <span className="w-3.5" />
        )}

        <button type="button" onClick={() => actions.onSelect(block.id)} className="flex-1 truncate text-left text-sm text-text-primary">
          {definition?.label ?? `? ${block.key}`}
        </button>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            title="Mover para cima"
            disabled={isFirst}
            onClick={() => actions.onMove(block.id, "up")}
            className="rounded px-1 text-xs text-text-secondary disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            title="Mover para baixo"
            disabled={isLast}
            onClick={() => actions.onMove(block.id, "down")}
            className="rounded px-1 text-xs text-text-secondary disabled:opacity-30"
          >
            ↓
          </button>
          <button type="button" title="Adicionar irmão" onClick={() => actions.onAddSibling(block.id)} className="rounded px-1 text-text-secondary">
            <PlusIcon className="size-3.5" />
          </button>
          <button type="button" title="Duplicar" onClick={() => actions.onDuplicate(block.id)} className="rounded px-1 text-text-secondary">
            <CopyIcon className="size-3.5" />
          </button>
          <button type="button" title="Remover" onClick={() => actions.onRemove(block.id)} className="rounded px-1 text-destructive">
            <TrashIcon className="size-3.5" />
          </button>
        </div>
      </div>

      {hiddenBlockCount > 0 && (
        <div className="mt-1 ml-4 flex items-center justify-between gap-2 rounded border border-warning-border bg-warning-soft px-2 py-1 text-xs text-warning">
          <span>
            {hiddenBlockCount} bloco(s) em colunas ocultas.
          </span>
          <button
            type="button"
            onClick={() => actions.onSetColumns(block.id, nextColumns)}
            className="shrink-0 underline"
          >
            Mostrar coluna {nextColumns}
          </button>
        </div>
      )}

      {hasAreas && !isCollapsed && (
        <div className="mt-1 ml-4 space-y-2 border-l border-border-subtle pl-3">
          {visibleAreas.map((area) => (
            <div key={area.key}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-text-tertiary uppercase">
                  {definition?.areaDefinitions?.find((candidate) => candidate.key === area.key)?.label ?? area.key}
                </p>
                <button
                  type="button"
                  title="Adicionar bloco nesta area"
                  onClick={() => actions.onAddChild(block.id, area.key)}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  <PlusIcon className="size-3.5" />
                </button>
              </div>
              <BlockTree
                blocks={area.blocks}
                definitionsByKey={definitionsByKey}
                selectedId={selectedId}
                errorBlockId={errorBlockId}
                collapsed={collapsed}
                actions={actions}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
