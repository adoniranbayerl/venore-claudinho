import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const sectorExists = vi.fn();
const groupBelongsToSector = vi.fn();
const definitionKeyExists = vi.fn();
const nextDefinitionPosition = vi.fn();
const insertMetricDefinition = vi.fn();
vi.mock("./store", () => ({
  sectorExists: (...args: unknown[]) => sectorExists(...args),
  groupBelongsToSector: (...args: unknown[]) => groupBelongsToSector(...args),
  definitionKeyExists: (...args: unknown[]) => definitionKeyExists(...args),
  nextDefinitionPosition: (...args: unknown[]) => nextDefinitionPosition(...args),
  insertMetricDefinition: (...args: unknown[]) => insertMetricDefinition(...args),
}));

const base = {
  sectorId: "s1",
  label: "  Alunos matriculados  ",
  unit: "count" as const,
  aggregation: "sum" as const,
  granularity: "monthly" as const,
  direction: "up_good" as const,
  actorId: "a1",
};

describe("createMetricDefinition", () => {
  beforeEach(() => {
    sectorExists.mockReset().mockResolvedValue(true);
    groupBelongsToSector.mockReset().mockResolvedValue(true);
    definitionKeyExists.mockReset().mockResolvedValue(false);
    nextDefinitionPosition.mockReset().mockResolvedValue(2);
    insertMetricDefinition.mockReset().mockImplementation(async (input: Record<string, unknown>) => ({ id: "d1", ...input }));
  });

  it("trims the label and derives a slug key scoped to the sector", async () => {
    const { createMetricDefinition } = await import("./service");
    const result = await createMetricDefinition(base);

    expect(result.success).toBe(true);
    expect(insertMetricDefinition).toHaveBeenCalledWith(
      expect.objectContaining({ key: "alunos-matriculados", label: "Alunos matriculados", groupId: null, position: 2 }),
    );
  });

  it("rejects a group from another sector", async () => {
    groupBelongsToSector.mockResolvedValue(false);
    const { createMetricDefinition } = await import("./service");
    const result = await createMetricDefinition({ ...base, groupId: "g-other" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.create-metric-definition.group_mismatch");
    expect(insertMetricDefinition).not.toHaveBeenCalled();
  });

  it("rejects an unknown sector", async () => {
    sectorExists.mockResolvedValue(false);
    const { createMetricDefinition } = await import("./service");
    const result = await createMetricDefinition(base);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.create-metric-definition.sector_not_found");
  });
});
