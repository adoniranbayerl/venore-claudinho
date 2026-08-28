import { beginOperation, endOperation } from "@/observability";
import { TV_SCREEN_KINDS } from "../../../contracts/types";
import { findBoardById } from "../shared/store";
import { existingSectorIds, existingTargetIds, replaceScreens } from "./store";
import type { SetTvScreensCommand, SetTvScreensResult } from "./types";

export async function setTvScreens(command: SetTvScreensCommand): Promise<SetTvScreensResult> {
  const board = await findBoardById(command.boardId);
  if (!board) {
    return { success: false, error: { code: "company-metrics.set-tv-screens.board_not_found", message: "Painel não encontrado." } };
  }

  for (const screen of command.screens) {
    if (!(TV_SCREEN_KINDS as readonly string[]).includes(screen.kind)) {
      return { success: false, error: { code: "company-metrics.set-tv-screens.invalid_kind", message: "Tipo de tela inválido." } };
    }
    if (!Number.isFinite(screen.dwellSeconds) || screen.dwellSeconds < 3 || screen.dwellSeconds > 600) {
      return { success: false, error: { code: "company-metrics.set-tv-screens.invalid_dwell", message: "O tempo de cada tela deve ficar entre 3 e 600 segundos." } };
    }
    if (screen.kind === "sector_kpis" && !screen.sectorId) {
      return { success: false, error: { code: "company-metrics.set-tv-screens.missing_sector", message: "Escolha o setor da tela de métricas." } };
    }
    if (screen.kind === "target_board" && !screen.targetId) {
      return { success: false, error: { code: "company-metrics.set-tv-screens.missing_target", message: "Escolha a meta da tela." } };
    }
  }

  const sectorIds = command.screens.filter((s) => s.kind === "sector_kpis" && s.sectorId).map((s) => s.sectorId as string);
  const targetIds = command.screens.filter((s) => s.kind === "target_board" && s.targetId).map((s) => s.targetId as string);
  const [validSectors, validTargets] = await Promise.all([existingSectorIds(sectorIds), existingTargetIds(targetIds)]);

  if (sectorIds.some((id) => !validSectors.has(id))) {
    return { success: false, error: { code: "company-metrics.set-tv-screens.sector_not_found", message: "Uma das telas aponta para um setor que não existe." } };
  }
  if (targetIds.some((id) => !validTargets.has(id))) {
    return { success: false, error: { code: "company-metrics.set-tv-screens.target_not_found", message: "Uma das telas aponta para uma meta que não existe." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.set-tv-screens",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  await replaceScreens(command.boardId, command.screens);

  endOperation(handle, { success: true });
  return { success: true, data: { boardId: command.boardId, screenCount: command.screens.length } };
}
