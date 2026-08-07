import type { CreateSceneInput } from "./types";

const KEY_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateCreateSceneInput(input: CreateSceneInput): { code: string; message: string } | null {
  if (!input.name || !input.name.trim()) {
    return { code: "broadcast.create-scene.invalid_name", message: "Informe um nome para a cena." };
  }
  if (!input.key || !KEY_PATTERN.test(input.key)) {
    return {
      code: "broadcast.create-scene.invalid_key",
      message: 'A chave da cena precisa ser kebab-case (ex: "abertura", "intervalo-cafe").',
    };
  }
  return null;
}
