import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const sectorExists = vi.fn();
const groupBelongsToSector = vi.fn();
const definitionIdsInSector = vi.fn();
const nextTargetPosition = vi.fn();
const insertTargetWithInputs = vi.fn();
vi.mock("./store", () => ({
  sectorExists: (...a: unknown[]) => sectorExists(...a),
  groupBelongsToSector: (...a: unknown[]) => groupBelongsToSector(...a),
  definitionIdsInSector: (...a: unknown[]) => definitionIdsInSector(...a),
  nextTargetPosition: (...a: unknown[]) => nextTargetPosition(...a),
  insertTargetWithInputs: (...a: unknown[]) => insertTargetWithInputs(...a),
}));

const base = {
  sectorId: "s1",
  label: "Entradas 2026/2",
  targetValue: 300,
  periodStart: "2026-02-01",
  periodEnd: "2026-07-31",
  inputs: [
    { definitionId: "d1", weight: 1, classification: "realized" as const },
    { definitionId: "d2", weight: 1, classification: "at_risk" as const },
  ],
  actorId: "a1",
};

describe("createTarget", () => {
  beforeEach(() => {
    sectorExists.mockReset().mockResolvedValue(true);
    groupBelongsToSector.mockReset().mockResolvedValue(true);
    definitionIdsInSector.mockReset().mockResolvedValue(new Set(["d1", "d2"]));
    nextTargetPosition.mockReset().mockResolvedValue(1);
    insertTargetWithInputs.mockReset().mockImplementation(async (target: Record<string, unknown>) => ({ id: "t1", ...target }));
  });

  it("creates the target with a default threshold of 0.85", async () => {
    const { createTarget } = await import("./service");
    const result = await createTarget(base);

    expect(result.success).toBe(true);
    expect(insertTargetWithInputs).toHaveBeenCalledWith(
      expect.objectContaining({ onTrackThreshold: 0.85, targetValue: 300 }),
      base.inputs,
    );
  });

  it("rejects an empty composition", async () => {
    const { createTarget } = await import("./service");
    const result = await createTarget({ ...base, inputs: [] });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.target.no_inputs");
    expect(insertTargetWithInputs).not.toHaveBeenCalled();
  });

  it("rejects an inverted period", async () => {
    const { createTarget } = await import("./service");
    const result = await createTarget({ ...base, periodStart: "2026-08-01", periodEnd: "2026-02-01" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.target.period_order");
  });

  it("rejects a composition referencing a definition from another sector", async () => {
    definitionIdsInSector.mockResolvedValue(new Set(["d1"]));
    const { createTarget } = await import("./service");
    const result = await createTarget(base);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.create-target.input_foreign_definition");
  });

  it("rejects a duplicated definition in the composition", async () => {
    const { createTarget } = await import("./service");
    const result = await createTarget({
      ...base,
      inputs: [
        { definitionId: "d1", weight: 1, classification: "realized" },
        { definitionId: "d1", weight: 2, classification: "at_risk" },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.target.input_duplicate");
  });
});
