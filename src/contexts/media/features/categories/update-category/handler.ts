import { authorizeActor } from "@/contexts/rbac";
import { updateCategory } from "./service";
import type { UpdateCategoryResult } from "./types";

export type UpdateCategoryHandlerInput = { id: string; name: string };

// Só o nome é editável — a `key` nasce do nome original e fica estável pra sempre (mesmo espírito
// de rbac roles.key), evitando quebrar algo que compare por chave fora deste context.
export async function updateCategoryHandler(input: UpdateCategoryHandlerInput): Promise<UpdateCategoryResult> {
  const name = input.name.trim();
  if (name.length === 0) {
    return {
      success: false,
      error: { code: "media.categories.invalid_name", message: "O nome da categoria não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("media.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateCategory({ id: input.id, name });
}
