import { authorizeActor } from "@/contexts/rbac";
import { createCategory } from "./service";
import type { CreateCategoryResult } from "./types";

export type CreateCategoryHandlerInput = { name: string };

// Chave é derivada do nome (slug), não digitada pelo admin — mesmo motivo de cms.categories:
// evita duas categorias com nomes visualmente diferentes mas chave colidente por acidente, sem
// exigir mais um campo no formulário.
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategoryHandler(input: CreateCategoryHandlerInput): Promise<CreateCategoryResult> {
  const name = input.name.trim();
  if (name.length === 0) {
    return {
      success: false,
      error: { code: "media.categories.invalid_name", message: "O nome da categoria não pode ser vazio." },
    };
  }

  const key = slugify(name);
  if (key.length === 0) {
    return {
      success: false,
      error: { code: "media.categories.invalid_name", message: "O nome da categoria precisa conter ao menos uma letra ou número." },
    };
  }

  const authz = await authorizeActor("media.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createCategory({ key, name });
}
