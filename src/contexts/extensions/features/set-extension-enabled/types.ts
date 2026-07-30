import type { OperationResult } from "@/shared/types";
import type { ExtensionKind, ExtensionStateRecord } from "../../contracts/types";

export type SetExtensionEnabledInput = {
  kind: ExtensionKind;
  key: string;
  enabled: boolean;
};

export type SetExtensionEnabledCommand = SetExtensionEnabledInput & { actorId: string };

export type SetExtensionEnabledResult = OperationResult<ExtensionStateRecord>;
