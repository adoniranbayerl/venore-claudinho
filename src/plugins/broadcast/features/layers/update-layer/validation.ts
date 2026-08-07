import type { UpdateLayerInput } from "./types";

const NUMERIC_FIELDS = ["x", "y", "width", "height", "zIndex"] as const;

export function validateUpdateLayerInput(input: UpdateLayerInput): { code: string; message: string } | null {
  if (!input.name || !input.name.trim()) {
    return { code: "broadcast.update-layer.invalid_name", message: "Informe um nome para a layer." };
  }
  for (const field of NUMERIC_FIELDS) {
    if (!Number.isFinite(input[field])) {
      return { code: "broadcast.update-layer.invalid_number", message: `O campo "${field}" precisa ser um número.` };
    }
  }
  return null;
}
