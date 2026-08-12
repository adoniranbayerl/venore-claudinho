import type { BlockRendererProps } from "@/platform/page-builder/block-renderers";
import { compositionToAbc, type KeySignature, type NotationToken, type TimeSignature } from "../components/notation-abc";
import { NotationSheetBlockClient } from "../components/notation-sheet-block-client";

function readTokens(data: Record<string, unknown>): NotationToken[] {
  const value = data.tokens;
  return Array.isArray(value) ? (value as NotationToken[]) : [];
}

function readCaption(data: Record<string, unknown>): string {
  const value = data.caption;
  return typeof value === "string" ? value : "";
}

function readAllowSingAlong(data: Record<string, unknown>): boolean {
  return data.allowSingAlong !== false;
}

function readKey(data: Record<string, unknown>): KeySignature {
  return typeof data.key === "string" ? (data.key as KeySignature) : "C";
}

function readTimeSignature(data: Record<string, unknown>): TimeSignature {
  return typeof data.timeSignature === "string" ? (data.timeSignature as TimeSignature) : "4/4";
}

function readBpm(data: Record<string, unknown>): number {
  return typeof data.bpm === "number" ? data.bpm : 90;
}

function readShowNoteNames(data: Record<string, unknown>): boolean {
  return data.showNoteNames === true;
}

// Mesmo padrão de RichtextBlock (block-renderers.tsx): bloco sem conteúdo não renderiza nada em
// nenhum modo — tokens: [] é o estado inicial de todo bloco recém-adicionado, antes do professor
// compor a melodia.
function hasNotationTokens(data: Record<string, unknown>): boolean {
  return readTokens(data).length > 0;
}

export function AcademyNotationSheetBlock({ block }: BlockRendererProps) {
  if (!hasNotationTokens(block.data)) return null;

  const tokens = readTokens(block.data);
  const abc = compositionToAbc({
    key: readKey(block.data),
    timeSignature: readTimeSignature(block.data),
    tokens,
    bpm: readBpm(block.data),
    showNoteNames: readShowNoteNames(block.data),
  });
  return (
    <NotationSheetBlockClient abc={abc} caption={readCaption(block.data)} allowSingAlong={readAllowSingAlong(block.data)} tokens={tokens} />
  );
}
