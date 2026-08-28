import { beginOperation, endOperation } from "@/observability";
import { slugify } from "../../../shared/slugify";
import { groupKeyExists, insertSectorGroup, nextGroupPosition, sectorExists } from "./store";
import type { CreateSectorGroupCommand, CreateSectorGroupResult } from "./types";

async function uniqueGroupKey(sectorId: string, label: string): Promise<string> {
  const base = slugify(label) || "grupo";
  let candidate = base;
  let attempt = 1;
  while (await groupKeyExists(sectorId, candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return candidate;
}

export async function createSectorGroup(command: CreateSectorGroupCommand): Promise<CreateSectorGroupResult> {
  if (!(await sectorExists(command.sectorId))) {
    return { success: false, error: { code: "company-metrics.create-sector-group.sector_not_found", message: "Setor não encontrado." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.create-sector-group",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const [key, position] = await Promise.all([uniqueGroupKey(command.sectorId, command.label), nextGroupPosition(command.sectorId)]);

  const record = await insertSectorGroup({
    sectorId: command.sectorId,
    key,
    label: command.label.trim(),
    logoMediaId: command.logoMediaId?.trim() || null,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
