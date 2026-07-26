import type { Area, Block } from "./contracts/block";
import type { ResolveBlockDefinition } from "./contracts/block-definition";

export type ValidateCompositionError = {
  code: string;
  message: string;
  path: string;
};

export type ValidateCompositionResult =
  | { valid: true }
  | { valid: false; errors: ValidateCompositionError[] };

const DEFAULT_MAX_DEPTH = 6;

export function validateComposition(
  composition: Block[],
  resolveDefinition: ResolveBlockDefinition,
  options?: { maxDepth?: number },
): ValidateCompositionResult {
  const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
  const errors: ValidateCompositionError[] = [];

  validateBlocks(composition, resolveDefinition, { isRoot: true, allowedBlockKeys: null }, 1, maxDepth, "$", errors);

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

function validateBlocks(
  blocks: Block[],
  resolveDefinition: ResolveBlockDefinition,
  position: { isRoot: boolean; allowedBlockKeys: string[] | null },
  depth: number,
  maxDepth: number,
  path: string,
  errors: ValidateCompositionError[],
): void {
  blocks.forEach((block, index) => {
    validateBlock(block, resolveDefinition, position, depth, maxDepth, `${path}[${index}]`, errors);
  });
}

function validateBlock(
  block: Block,
  resolveDefinition: ResolveBlockDefinition,
  position: { isRoot: boolean; allowedBlockKeys: string[] | null },
  depth: number,
  maxDepth: number,
  path: string,
  errors: ValidateCompositionError[],
): void {
  if (depth > maxDepth) {
    errors.push({
      code: "cms.composition.max_depth_exceeded",
      message: `Profundidade máxima de composição (${maxDepth}) excedida em "${path}".`,
      path,
    });
    return;
  }

  const definition = resolveDefinition(block.key);
  if (!definition) {
    errors.push({
      code: "cms.composition.unknown_block",
      message: `Bloco com key "${block.key}" desconhecido em "${path}".`,
      path,
    });
    return;
  }

  if (position.isRoot && !definition.allowedInRoot) {
    errors.push({
      code: "cms.composition.block_not_allowed_in_root",
      message: `Bloco "${block.key}" não pode aparecer na raiz da composição ("${path}").`,
      path,
    });
  } else if (!position.isRoot && position.allowedBlockKeys && !position.allowedBlockKeys.includes(block.key)) {
    errors.push({
      code: "cms.composition.block_not_allowed_in_area",
      message: `Bloco "${block.key}" não é permitido nesta area ("${path}").`,
      path,
    });
  }

  if (definition.structure === "leaf") {
    if (block.areas.length > 0) {
      errors.push({
        code: "cms.composition.leaf_with_areas",
        message: `Bloco "${block.key}" é "leaf" e não pode ter areas ("${path}").`,
        path,
      });
    }
    return;
  }

  validateAreas(block.areas, definition.areaDefinitions ?? [], resolveDefinition, depth, maxDepth, path, errors);
}

function validateAreas(
  areas: Area[],
  areaDefinitions: { key: string; allowedBlockKeys: string[] }[],
  resolveDefinition: ResolveBlockDefinition,
  depth: number,
  maxDepth: number,
  path: string,
  errors: ValidateCompositionError[],
): void {
  const definedKeys = new Set(areaDefinitions.map((areaDefinition) => areaDefinition.key));

  areas.forEach((area, index) => {
    const areaPath = `${path}.areas[${index}]`;
    const areaDefinition = areaDefinitions.find((candidate) => candidate.key === area.key);

    if (!definedKeys.has(area.key) || !areaDefinition) {
      errors.push({
        code: "cms.composition.unknown_area",
        message: `Area "${area.key}" não é declarada para este bloco ("${areaPath}").`,
        path: areaPath,
      });
      return;
    }

    validateBlocks(
      area.blocks,
      resolveDefinition,
      { isRoot: false, allowedBlockKeys: areaDefinition.allowedBlockKeys },
      depth + 1,
      maxDepth,
      areaPath,
      errors,
    );
  });
}
