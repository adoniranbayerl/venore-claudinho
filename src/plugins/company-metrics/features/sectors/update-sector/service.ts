import { beginOperation, endOperation } from "@/observability";
import { findSectorById, updateSectorRow } from "./store";
import type { UpdateSectorCommand, UpdateSectorResult } from "./types";

// key não é tocada de propósito (ver create-sector/service.ts) — só rótulo/descrição/ícone.
export async function updateSector(command: UpdateSectorCommand): Promise<UpdateSectorResult> {
  const existing = await findSectorById(command.sectorId);
  if (!existing) {
    return { success: false, error: { code: "company-metrics.update-sector.not_found", message: "Setor não encontrado." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.update-sector",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await updateSectorRow(command.sectorId, {
    name: command.name.trim(),
    description: command.description?.trim() || null,
    icon: command.icon?.trim() || null,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
