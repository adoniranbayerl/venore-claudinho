import { beginOperation, endOperation } from "@/observability";
import { findSectorById, setSectorArchivedAt } from "./store";
import type { ArchiveSectorCommand, ArchiveSectorResult } from "./types";

// Arquivar (soft) em vez de apagar — o histórico de métricas/metas do setor continua existindo,
// só some das listagens. Reversível (archived: false).
export async function archiveSector(command: ArchiveSectorCommand): Promise<ArchiveSectorResult> {
  const existing = await findSectorById(command.sectorId);
  if (!existing) {
    return { success: false, error: { code: "company-metrics.archive-sector.not_found", message: "Setor não encontrado." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.archive-sector",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await setSectorArchivedAt(command.sectorId, command.archived ? new Date() : null);

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
