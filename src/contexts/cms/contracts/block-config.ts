import type { BlockDefinition } from "./block-definition";

// Módulo neutro (sem "use client", sem "use server"): importado tanto pelo block-renderer
// (server) quanto pelo builder (client) — função é livre de importar dos dois lados, só não pode
// atravessar o boundary RSC como valor de prop (por isso BlockDefinition não guarda predicado).
export function isBlockConfigured(definition: BlockDefinition, data: Record<string, unknown>): boolean {
  const requiredFields = definition.requiredDataFields ?? [];

  return requiredFields.every((field) => {
    const value = data[field];
    if (value === undefined || value === null) {
      return false;
    }
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    return true;
  });
}
