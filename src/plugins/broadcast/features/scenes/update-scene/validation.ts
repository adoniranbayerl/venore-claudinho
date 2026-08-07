import type { UpdateSceneInput } from "./types";

export function validateUpdateSceneInput(input: UpdateSceneInput): { code: string; message: string } | null {
  if (!input.name || !input.name.trim()) {
    return { code: "broadcast.update-scene.invalid_name", message: "Informe um nome para a cena." };
  }
  return null;
}
