import type { OperationResult } from "@/shared/types";
import type { ExtensionKind } from "../../contracts/types";

export type ListExtensionStatesQuery = { kind: ExtensionKind };

export type ExtensionStateEntry = { installed: boolean; enabled: boolean };

// Só as linhas explícitas (instaladas e/ou já tocadas alguma vez) — uma chave ausente do mapa
// deve ser tratada por quem chama como NÃO instalada e habilitada-por-default (contracts/types.ts).
export type ListExtensionStatesResult = OperationResult<Record<string, ExtensionStateEntry>>;
