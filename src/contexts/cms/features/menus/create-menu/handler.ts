import { authorizeActor } from "@/contexts/rbac";
import { createMenu } from "./service";
import type { CreateMenuInput, CreateMenuResult } from "./types";

const VALID_LOCATIONS = ["main", "header", "contextual", "sitemap"];

export async function createMenuHandler(input: CreateMenuInput): Promise<CreateMenuResult> {
  if (input.key.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_key", message: "A chave do menu não pode ser vazia." } };
  }

  if (input.name.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_name", message: "O nome do menu não pode ser vazio." } };
  }

  if (!VALID_LOCATIONS.includes(input.location)) {
    return {
      success: false,
      error: { code: "cms.menus.invalid_location", message: `Location "${input.location}" inválida.` },
    };
  }

  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createMenu({ ...input, actorId: authz.actorId });
}
