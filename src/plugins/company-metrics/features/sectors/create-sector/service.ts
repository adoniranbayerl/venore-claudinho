import { beginOperation, endOperation } from "@/observability";
import { slugify } from "../../../shared/slugify";
import { insertSector, nextSectorPosition, sectorKeyExists } from "./store";
import type { CreateSectorCommand, CreateSectorResult } from "./types";

// key gerada do nome e nunca reexposta pra edição — vira parte da URL das telas de TV, trocar
// depois quebraria um link já compartilhado. Sufixo numérico só resolve colisão.
async function uniqueSectorKey(name: string): Promise<string> {
  const base = slugify(name) || "setor";
  let candidate = base;
  let attempt = 1;
  while (await sectorKeyExists(candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return candidate;
}

export async function createSector(command: CreateSectorCommand): Promise<CreateSectorResult> {
  const handle = beginOperation({
    useCase: "company-metrics.create-sector",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const [key, position] = await Promise.all([uniqueSectorKey(command.name), nextSectorPosition()]);

  const record = await insertSector({
    key,
    name: command.name.trim(),
    description: command.description?.trim() || null,
    icon: command.icon?.trim() || null,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
