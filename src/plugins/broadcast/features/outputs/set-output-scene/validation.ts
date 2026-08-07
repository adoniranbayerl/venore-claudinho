import type { SetOutputSceneInput } from "./types";

export function validateSetOutputSceneInput(input: SetOutputSceneInput): { code: string; message: string } | null {
  if (!input.outputId) {
    return { code: "broadcast.set-output-scene.invalid_output", message: "Saída inválida." };
  }
  return null;
}
