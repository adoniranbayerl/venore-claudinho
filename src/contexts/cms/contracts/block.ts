import { z } from "zod";

export type Area = {
  key: string;
  blocks: Block[];
};

export type Block = {
  id: string;
  key: string;
  slot: string;
  data: Record<string, unknown>;
  areas: Area[];
};

// z.lazy() com recursão exige o tipo TS anotado explicitamente (z.ZodType<Block>) antes do
// schema — senão o tsc entra em loop de inferência ou emite "implicitly has type any".
export const blockSchema: z.ZodType<Block> = z.lazy(() =>
  z.object({
    id: z.string(),
    key: z.string(),
    slot: z.string(),
    data: z.record(z.string(), z.unknown()),
    areas: z.array(areaSchema),
  }),
);

export const areaSchema: z.ZodType<Area> = z.lazy(() =>
  z.object({
    key: z.string(),
    blocks: z.array(blockSchema),
  }),
);

export type Composition = Block[];
export const compositionSchema: z.ZodType<Composition> = z.array(blockSchema);
