import type { OperationResult } from "@/shared/types";
import type { ExtensionKind } from "../../contracts/types";

export type GetExtensionStateQuery = { kind: ExtensionKind; key: string };

// Ausência de linha == habilitado (ver comentário em database/schema/index.ts) — por isso o
// resultado é só o booleano resolvido, não o registro cru (que pode não existir).
export type GetExtensionStateResult = OperationResult<{ enabled: boolean }>;
