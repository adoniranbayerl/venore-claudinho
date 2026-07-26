import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";
import type { Block } from "../../../contracts/block";
import { isBlockConfigured } from "../../../contracts/block-config";
import type { ResolveBlockDefinition } from "../../../contracts/block-definition";
import { getEntryComposition as extractComposition } from "../../../contracts/entry-body";
import { findEntryById, markEntryPublished } from "./store";
import type { PublishEntryCommand, PublishEntryResult } from "./types";

// Toda checagem roda antes de publicar, e acumula problema em vez de sair no primeiro (mesmo
// padrão de academy/features/courses/publish-course/service.ts) — autor corrige tudo de uma vez
// em vez de descobrir bloco por bloco a cada nova tentativa de publicar.
function collectUnconfiguredBlockProblems(blocks: Block[], resolveDefinition: ResolveBlockDefinition): string[] {
  const problems: string[] = [];

  blocks.forEach((block) => {
    const definition = resolveDefinition(block.key);
    if (definition && !isBlockConfigured(definition, block.data)) {
      problems.push(`${definition.label}: ${definition.missingConfigMessage ?? "bloco não configurado."}`);
    }
    block.areas.forEach((area) => {
      problems.push(...collectUnconfiguredBlockProblems(area.blocks, resolveDefinition));
    });
  });

  return problems;
}

export async function publishEntry(command: PublishEntryCommand): Promise<PublishEntryResult> {
  const handle = beginOperation({
    useCase: "cms.publish-entry",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findEntryById(command.id);
  if (!existing) {
    const error = { code: "cms.entries.not_found", message: `Entry "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const composition = extractComposition(existing.data);
  if (composition) {
    const problems = collectUnconfiguredBlockProblems(composition, command.resolveDefinition);
    if (problems.length > 0) {
      const error = { code: "cms.entries.publish_validation_failed", message: problems.join(" ") };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const entry = await markEntryPublished(command.id);

  // Invalidação é responsabilidade de quem escreve (docs/venore-docks.md — Cache).
  invalidateCacheByPrefix("cms:entries:published");

  endOperation(handle, { success: true });
  return { success: true, data: entry };
}
