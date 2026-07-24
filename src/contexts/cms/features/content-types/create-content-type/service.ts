import { beginOperation, endOperation } from "@/observability";
import { invalidateCache } from "../../../../../infrastructure/cache/memory-cache";
import { findContentTypeByKey, insertContentType } from "./store";
import type { CreateContentTypeCommand, CreateContentTypeResult } from "./types";

export async function createContentType(command: CreateContentTypeCommand): Promise<CreateContentTypeResult> {
  const handle = beginOperation({
    useCase: "cms.create-content-type",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findContentTypeByKey(command.key);
  if (existing) {
    const error = {
      code: "cms.content-types.key_taken",
      message: `Já existe um content type com a key "${command.key}".`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const contentType = await insertContentType({
    key: command.key,
    name: command.name,
    description: command.description,
  });

  // Invalidação é responsabilidade de quem escreve (docs/venore-docks.md — Cache).
  invalidateCache("cms:content-types");

  endOperation(handle, { success: true });
  return { success: true, data: contentType };
}
