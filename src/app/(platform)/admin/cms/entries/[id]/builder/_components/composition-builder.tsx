"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { BlockDefinition, Composition } from "@/contexts/cms";
import {
  addChild,
  appendToRoot,
  createBlock,
  findBlock,
  getPositionContext,
  insertSibling,
  moveBlock,
  duplicateBlock,
  removeBlock,
  updateBlockData,
} from "@/platform/page-builder/composition-tree";
import { saveEntryCompositionAction } from "../actions";
import { BlockFieldsPanel } from "./block-fields-panel";
import { BlockPaletteDialog } from "./block-palette-dialog";
import { BlockTree } from "./block-tree";

type PaletteRequest = { mode: "root" } | { mode: "sibling"; anchorId: string } | { mode: "child"; parentId: string; areaKey: string };

export function CompositionBuilder({
  entryId,
  entryTitle,
  entrySlug,
  initialComposition,
  definitions,
  preview,
}: {
  entryId: string;
  entryTitle: string;
  entrySlug: string;
  initialComposition: Composition;
  definitions: BlockDefinition[];
  preview: React.ReactNode;
}) {
  const [composition, setComposition] = useState<Composition>(initialComposition);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [paletteRequest, setPaletteRequest] = useState<PaletteRequest | null>(null);
  const [saveError, setSaveError] = useState<{ message: string; blockId: string | null } | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const definitionsByKey = useMemo(() => new Map(definitions.map((definition) => [definition.key, definition])), [definitions]);
  const resolveDefinition = (key: string) => definitionsByKey.get(key) ?? null;

  const selectedBlock = selectedId ? findBlock(composition, selectedId) : null;
  const selectedDefinition = selectedBlock ? resolveDefinition(selectedBlock.key) : null;

  function mutate(next: Composition) {
    setComposition(next);
    setSaved(false);
  }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function paletteDefinitions(request: PaletteRequest): BlockDefinition[] {
    if (request.mode === "root") {
      return definitions.filter((definition) => definition.allowedInRoot);
    }
    if (request.mode === "child") {
      const parentDefinition = resolveDefinition(findBlock(composition, request.parentId)?.key ?? "");
      const areaDefinition = parentDefinition?.areaDefinitions?.find((area) => area.key === request.areaKey);
      const allowedKeys = new Set(areaDefinition?.allowedBlockKeys ?? []);
      return definitions.filter((definition) => allowedKeys.has(definition.key));
    }
    const position = getPositionContext(composition, request.anchorId, resolveDefinition);
    if (!position) return [];
    if (position.isRoot) {
      return definitions.filter((definition) => definition.allowedInRoot);
    }
    const allowedKeys = new Set(position.allowedBlockKeys);
    return definitions.filter((definition) => allowedKeys.has(definition.key));
  }

  function handlePickDefinition(definition: BlockDefinition) {
    if (!paletteRequest) return;
    const newBlock = createBlock(definition);

    if (paletteRequest.mode === "root") {
      mutate(appendToRoot(composition, newBlock));
    } else if (paletteRequest.mode === "sibling") {
      mutate(insertSibling(composition, paletteRequest.anchorId, newBlock, "after"));
    } else {
      mutate(addChild(composition, paletteRequest.parentId, paletteRequest.areaKey, newBlock));
    }

    setSelectedId(newBlock.id);
    setPaletteRequest(null);
  }

  function handleRemove(id: string) {
    mutate(removeBlock(composition, id));
    if (selectedId === id) setSelectedId(null);
  }

  function handleSave() {
    startTransition(async () => {
      setSaveError(null);
      const result = await saveEntryCompositionAction(entryId, composition);
      if (!result.success) {
        setSaveError({ message: result.error.message, blockId: result.error.blockId });
        if (result.error.blockId) setSelectedId(result.error.blockId);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Editor visual — {entryTitle}</h1>
          <p className="text-xs text-muted-foreground/56">/{entrySlug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/cms/entries/${entryId}`} className="text-sm text-muted-foreground hover:text-foreground">
            Voltar
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {saved && <p className="text-sm text-success">Composição salva.</p>}
      {saveError && !saveError.blockId && <p className="text-sm text-destructive">{saveError.message}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        <div className="rounded border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground/56 uppercase">Composição</p>
            <button
              type="button"
              onClick={() => setPaletteRequest({ mode: "root" })}
              className="rounded border border-ring px-2 py-1 text-xs font-medium text-foreground"
            >
              + Adicionar bloco
            </button>
          </div>

          <BlockTree
            blocks={composition}
            definitionsByKey={definitionsByKey}
            selectedId={selectedId}
            errorBlockId={saveError?.blockId ?? null}
            collapsed={collapsed}
            actions={{
              onSelect: setSelectedId,
              onToggleCollapse: toggleCollapse,
              onAddSibling: (id) => setPaletteRequest({ mode: "sibling", anchorId: id }),
              onAddChild: (parentId, areaKey) => setPaletteRequest({ mode: "child", parentId, areaKey }),
              onDuplicate: (id) => mutate(duplicateBlock(composition, id)),
              onRemove: handleRemove,
              onMove: (id, direction) => mutate(moveBlock(composition, id, direction)),
              onSetColumns: (id, columns) => {
                const target = findBlock(composition, id);
                if (!target) return;
                mutate(updateBlockData(composition, id, { ...target.data, columns }));
              },
            }}
          />
        </div>

        <div className="rounded border border-border bg-card p-4">
          {selectedBlock && selectedDefinition ? (
            <BlockFieldsPanel
              block={selectedBlock}
              definition={selectedDefinition}
              errorMessage={saveError?.blockId === selectedBlock.id ? saveError.message : null}
              onChange={(data) => mutate(updateBlockData(composition, selectedBlock.id, data))}
            />
          ) : (
            <p className="text-sm text-muted-foreground/56">Selecione um bloco na árvore para editar seus campos.</p>
          )}
        </div>
      </div>

      <div className="rounded border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground/56 uppercase">Pré-visualização</p>
          <p className="text-xs text-muted-foreground/56">Reflete a última versão salva</p>
        </div>
        <div className="space-y-4">{preview}</div>
      </div>

      {paletteRequest && (
        <BlockPaletteDialog
          open
          onOpenChange={(open) => {
            if (!open) setPaletteRequest(null);
          }}
          definitions={paletteDefinitions(paletteRequest)}
          onSelect={handlePickDefinition}
        />
      )}
    </div>
  );
}
