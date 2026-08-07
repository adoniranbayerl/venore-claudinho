import { BROADCAST_LAYER_TYPES } from "../../../contracts/types";
import type { CreateLayerInput } from "./types";

const NUMERIC_FIELDS = ["x", "y", "width", "height", "zIndex"] as const;

export function validateCreateLayerInput(input: CreateLayerInput): { code: string; message: string } | null {
  if (!input.sceneId) {
    return { code: "broadcast.create-layer.invalid_scene", message: "Cena inválida." };
  }
  if (!input.name || !input.name.trim()) {
    return { code: "broadcast.create-layer.invalid_name", message: "Informe um nome para a layer." };
  }
  if (!BROADCAST_LAYER_TYPES.includes(input.type)) {
    return { code: "broadcast.create-layer.invalid_type", message: `Tipo de layer desconhecido: "${input.type}".` };
  }
  for (const field of NUMERIC_FIELDS) {
    const value = input[field];
    if (value !== undefined && !Number.isFinite(value)) {
      return { code: "broadcast.create-layer.invalid_number", message: `O campo "${field}" precisa ser um número.` };
    }
  }
  return null;
}
