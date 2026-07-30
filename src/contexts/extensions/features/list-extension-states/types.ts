import type { OperationResult } from "@/shared/types";
import type { ExtensionKind } from "../../contracts/types";

export type ListExtensionStatesQuery = { kind: ExtensionKind };

// Só as linhas explícitas (desabilitadas ou já tocadas alguma vez) — uma chave ausente do mapa
// deve ser tratada por quem chama como habilitada (default implícito, contracts/types.ts).
export type ListExtensionStatesResult = OperationResult<Record<string, boolean>>;
