import type { OperationResult } from "@/shared/types";
import type { ExtensionKind } from "../../contracts/types";

export type GetExtensionStateQuery = { kind: ExtensionKind; key: string };

// Ausência de linha == não instalado E habilitado-por-default (ver comentário em
// database/schema/index.ts) — por isso o resultado é só os booleanos resolvidos, não o registro
// cru (que pode não existir).
export type GetExtensionStateResult = OperationResult<{ enabled: boolean; installed: boolean }>;
