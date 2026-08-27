import type { OperationResult } from "@/shared/types";
import type { ExtensionKind, ExtensionStateRecord } from "../../contracts/types";

export type SetExtensionInstalledInput = {
  kind: ExtensionKind;
  key: string;
};

export type SetExtensionInstalledCommand = SetExtensionInstalledInput & { actorId: string };

export type SetExtensionInstalledResult = OperationResult<ExtensionStateRecord>;
