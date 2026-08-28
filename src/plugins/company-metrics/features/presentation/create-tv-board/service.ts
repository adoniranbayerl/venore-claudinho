import { db } from "@/infrastructure/database/client";
import { beginOperation, endOperation } from "@/observability";
import { tvBoards } from "../../../database/schema";
import type { TvBoardRecord } from "../../../contracts/types";
import type { CreateTvBoardCommand, CreateTvBoardResult } from "./types";

export async function createTvBoard(command: CreateTvBoardCommand): Promise<CreateTvBoardResult> {
  if (command.label.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.create-tv-board.invalid_label", message: "O nome do painel não pode ser vazio." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.create-tv-board",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const [row] = await db.insert(tvBoards).values({ label: command.label.trim() }).returning();

  endOperation(handle, { success: true });
  return { success: true, data: row as TvBoardRecord };
}
