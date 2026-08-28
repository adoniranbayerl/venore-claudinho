import { beginOperation, endOperation } from "@/observability";
import { ROW_BLOCK_KEY, resolveRowColumns } from "@/platform/page-builder/row-columns";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";
import type { Block } from "../../../contracts/block";
import { isBlockConfigured } from "../../../contracts/block-config";
import type { ResolveBlockDefinition } from "../../../contracts/block-definition";
import { getEntryComposition as extractComposition } from "../../../contracts/entry-body";
import { assertCmsCategoryScope } from "../../../shared/scoped-authorization";
import { findEntryById, markEntryPublished } from "./store";
import type { PublishEntryCommand, PublishEntryResult } from "./types";

// Coluna oculta de uma row (data.columns menor que o número de areas) não é renderizada nem
// no preview nem na página pública (ver block-renderer.tsx) — resolveRowColumns é a mesma fonte
// de clamp usada lá, então "oculta" aqui é exatamente "oculta" na hora de exibir a página.
type HiddenLocation = { row: number; column: number } | null;

// Toda checagem roda antes de publicar, e acumula problema em vez de sair no primeiro (mesmo
// padrão de academy/features/courses/publish-course/service.ts) — autor corrige tudo de uma vez
// em vez de descobrir bloco por bloco a cada nova tentativa de publicar.
function collectUnconfiguredBlockProblems(
  blocks: Block[],
  resolveDefinition: ResolveBlockDefinition,
  rowCounter: { value: number },
  hiddenLocation: HiddenLocation,
): string[] {
  const problems: string[] = [];

  blocks.forEach((block) => {
    const definition = resolveDefinition(block.key);
    if (definition && !isBlockConfigured(definition, block.data)) {
      const message = `${definition.label}: ${definition.missingConfigMessage ?? "bloco não configurado."}`;
      problems.push(
        hiddenLocation
          ? `Linha ${hiddenLocation.row}, coluna ${hiddenLocation.column} (oculta): ${message}`
          : message,
      );
    }

    if (block.key === ROW_BLOCK_KEY) {
      rowCounter.value += 1;
      const rowNumber = rowCounter.value;
      const visibleColumns = resolveRowColumns(block.data);
      block.areas.forEach((area, areaIndex) => {
        const columnNumber = areaIndex + 1;
        const areaHiddenLocation: HiddenLocation =
          hiddenLocation ?? (columnNumber > visibleColumns ? { row: rowNumber, column: columnNumber } : null);
        problems.push(...collectUnconfiguredBlockProblems(area.blocks, resolveDefinition, rowCounter, areaHiddenLocation));
      });
    } else {
      block.areas.forEach((area) => {
        problems.push(...collectUnconfiguredBlockProblems(area.blocks, resolveDefinition, rowCounter, hiddenLocation));
      });
    }
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

  // Fase C / D6: publicar exige `cms.entries.publish` ALCANÇANDO a categoria da entry. Um author
  // escopado (só `cms.entries.manage`) cai aqui e não publica (docs/rbac-scoped-roles.md D6).
  const scope = await assertCmsCategoryScope(command.actorId, ["cms.entries.publish"], existing.categoryId);
  if (!scope.success) {
    endOperation(handle, { success: false, error: scope.error });
    return { success: false, error: scope.error };
  }

  const composition = extractComposition(existing.data);
  if (composition) {
    const problems = collectUnconfiguredBlockProblems(composition, command.resolveDefinition, { value: 0 }, null);
    if (problems.length > 0) {
      const error = { code: "cms.entries.publish_validation_failed", message: problems.join(" ") };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const entry = await markEntryPublished(command.id);

  // Invalidação é responsabilidade de quem escreve (docs/venore-docks.md — Cache). Publicar
  // afeta a resolução de qualquer item de menu "content" que aponte pra esta entry — gatilho de
  // invalidação da navegação (regra: publicação/despublicação invalida cache de menu).
  invalidateCacheByPrefix("cms:entries:published");
  invalidateCacheByPrefix("cms:navigation");

  endOperation(handle, { success: true });
  return { success: true, data: entry };
}
